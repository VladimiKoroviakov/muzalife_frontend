import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { iconPaths } from '../ui/icons/iconPaths';
import { Table, TextCell, EmptyCell, TableCell } from '../layout/dashboard/TableComponents';
import { Skeleton } from '../ui/skeleton';
import { apiService } from '../../services/api';
import { BoughtProduct, Order, BoughtScenariosContentProps } from '../../types';
import ReviewPanel from './ReviewPanel';
import { CacheManager } from '../../utils/cache-manager';
import config from '../../config';

export function PurchaseHistoryContent({
	onBack: _onBack,
}: BoughtScenariosContentProps) {
	const [showReviewScreen, setShowReviewScreen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [reviewedProducts, setReviewedProducts] = useState<Set<number>>(new Set());
	const [boughtProducts, setBoughtProducts] = useState<BoughtProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const tableContainerRef = useRef<HTMLDivElement>(null);
	const [tableHeight, setTableHeight] = useState<number>(0);

	const formatDate = (dateString: string): string => {
		if (!dateString) {return 'Невідома дата';}

		try {
		const date = new Date(dateString);
		return date.toLocaleDateString('uk-UA', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
		} catch {
		return dateString;
		}
	};

	// Load user reviews with cache-first approach
	const loadUserReviews = useCallback(async () => {
		try {
		const cacheKey = config.cacheKeys.REVIEWED_PRODUCTS;
		const timestampKey = `${config.cacheKeys.REVIEWED_PRODUCTS}_timestamp`;
		const cachedProductIds = CacheManager.getItem<number[]>(cacheKey);
		const cacheTimestamp = CacheManager.getItem<number>(timestampKey);
		const isCacheValid = cacheTimestamp && Date.now() - cacheTimestamp < 60 * 60 * 1000;

		if (cachedProductIds && isCacheValid) {
			setReviewedProducts(new Set(cachedProductIds));
			return;
		}

		const userProfile = await apiService.getProfile();
		if (!userProfile?.id) {
			throw new Error('User not authenticated');
		}

		try {
			const reviews = await apiService.getUserReviews(userProfile.id);
			const reviewedProductIds = reviews.map((review) => review.productId);

			setReviewedProducts(new Set(reviewedProductIds));

			CacheManager.setItem(cacheKey, reviewedProductIds);
			CacheManager.setItem(timestampKey, Date.now());

		} catch (apiError: unknown) {
			console.error('API error loading user reviews:', apiError);

			if (cachedProductIds) {
			setReviewedProducts(new Set(cachedProductIds));
			} else {
			setReviewedProducts(new Set());
			}

			CacheManager.setItem(timestampKey, Date.now());
		}

		} catch (error) {
			console.error('Error in loadUserReviews:', error);
			const cachedProductIds = CacheManager.getItem<number[]>(config.cacheKeys.REVIEWED_PRODUCTS);
			if (cachedProductIds) {
				setReviewedProducts(new Set(cachedProductIds));
			}
		}
	}, []);

	// Load bought products
	useEffect(() => {
		const loadBoughtProducts = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const products = await apiService.getBoughtProducts();
			setBoughtProducts(products);

		} catch (error) {
			console.error('Error loading bought products:', error);
			setError('Не вдалося завантажити історію покупок');
			toast.error('Помилка завантаження історії покупок');
		} finally {
			setIsLoading(false);
		}
		};

		loadBoughtProducts();
	}, []);

	// Load user reviews when bought products are loaded
	useEffect(() => {
		if (boughtProducts.length > 0 && !isLoading) {
		loadUserReviews();
		}
	}, [boughtProducts, isLoading, loadUserReviews]);

	// Calculate table height
	useEffect(() => {
		const updateTableHeight = () => {
		if (tableContainerRef.current) {
			const container = tableContainerRef.current;
			const style = window.getComputedStyle(container);
			const paddingTop = parseFloat(style.paddingTop);
			const paddingBottom = parseFloat(style.paddingBottom);
			const height = container.clientHeight - paddingTop - paddingBottom;
			setTableHeight(height);
		}
		};

		updateTableHeight();
		window.addEventListener('resize', updateTableHeight);
		return () => window.removeEventListener('resize', updateTableHeight);
	}, []);

	// Transform bought products to orders format
	const orders: Order[] = boughtProducts.map((product) => ({
		id: product.id,
		name: product.title || 'Невідомий матеріал',
		date: formatDate(product.boughtAt || new Date().toISOString()),
		materialType: product.type || 'Не вказано',
		hidden: product.hidden
	}));

	const getRowBg = (index: number) => index % 2 === 0 ? '#f2f2f2' : '#e6e6e6';

	const getEmptyRowsCount = () => {
		if (orders.length === 0) {return 0;}

		const rowHeight = 40;

		if (tableHeight > 0) {
		const availableHeight = tableHeight - rowHeight;
		const rowsThatFit = Math.floor(availableHeight / rowHeight);
		const emptyRowsNeeded = Math.max(0, rowsThatFit - orders.length);
		return emptyRowsNeeded;
		}

		return Math.max(0, 13 - orders.length);
	};

	const emptyRowsCount = getEmptyRowsCount();

	const handleResendMaterial = async (materialName: string, purchaseDate: string) => {
		const order = orders.find((o) => o.name === materialName && o.date === purchaseDate);
		if (!order) {
			toast.error('Не вдалося знайти замовлення');
			return;
		}
		try {
			await apiService.resendProductMaterials(order.id);
			toast.success(`Матеріал "${materialName}" надіслано на вашу email адресу`);
		} catch {
			toast.error('Помилка при відправці матеріалу');
		}
	};

	const handleOpenReview = (order: Order) => {
		if (order.hidden) {
			toast.error('Матеріал недоступний', {
				description: 'Цей матеріал було видалено з каталогу і відгук на нього залишити неможливо'
			});
			return;
		}

		if (reviewedProducts.has(order.id)) {
			toast.error('Ви вже залишили відгук', {
				description: 'Ви можете залишити лише один відгук на цей матеріал'
			});
			return;
		}

		setSelectedOrder(order);
		setShowReviewScreen(true);
	};

	const handleCloseReview = () => {
		setShowReviewScreen(false);
		setSelectedOrder(null);
	};

	const handleSubmitReview = async (rating: number, reviewText: string) => {
		try {
		if (!selectedOrder) {return;}

		await apiService.submitReview(
			selectedOrder.id,
			rating,
			reviewText
		);

		toast.success('Відгук успішно надіслано!');

		const updatedReviewedProducts = new Set([...reviewedProducts, selectedOrder.id]);
		setReviewedProducts(updatedReviewedProducts);

		const cacheKey = config.cacheKeys.REVIEWED_PRODUCTS;
		const timestampKey = `${config.cacheKeys.REVIEWED_PRODUCTS}_timestamp`;

		const currentCache = CacheManager.getItem<number[]>(cacheKey) || [];
		if (!currentCache.includes(selectedOrder.id)) {
			const updatedCache = [...currentCache, selectedOrder.id];
			CacheManager.setItem(cacheKey, updatedCache);
			CacheManager.setItem(timestampKey, Date.now());
		}

		handleCloseReview();
		} catch (error) {
		console.error('Error submitting review:', error);
		toast.error('Помилка при відправці відгуку');
		throw error;
		}
	};

	// Generate table data
	const tableColumns = orders.length > 0 && !isLoading ? [
		{
		header: 'Назва матеріалу',
		width: '50%',
		minWidth: '200px',
		cells: [
			...orders.map((order, index) => (
			<TextCell
				key={`name-${order.id}`}
				text={order.name}
				bg={getRowBg(index)}
			/>
			)),
			...Array.from({ length: emptyRowsCount }, (_, index) => (
			<EmptyCell
				key={`empty-name-${index}`}
				bg={getRowBg(orders.length + index)}
			/>
			))
		]
		},
		{
		header: 'Тип матеріалу',
		width: '25%',
		minWidth: '100px',
		cells: [
			...orders.map((order, index) => (
			<TextCell
				key={`type-${order.id}`}
				text={order.materialType || 'Не вказано'}
				bg={getRowBg(index)}
				color="#4d4d4d"
			/>
			)),
			...Array.from({ length: emptyRowsCount }, (_, index) => (
			<EmptyCell
				key={`empty-type-${index}`}
				bg={getRowBg(orders.length + index)}
			/>
			))
		]
		},
		{
		header: 'Дата покупки',
		width: '15%',
		minWidth: '100px',
		cells: [
			...orders.map((order, index) => (
			<TextCell
				key={`date-${order.id}`}
				text={order.date}
				bg={getRowBg(index)}
				color="#4d4d4d"
			/>
			)),
			...Array.from({ length: emptyRowsCount }, (_, index) => (
			<EmptyCell
				key={`empty-date-${index}`}
				bg={getRowBg(orders.length + index)}
			/>
			))
		]
		},
		{
		header: 'Дії',
		width: '10%',
		minWidth: '100px',
		cells: [
			...orders.map((order, index) => {
			const isReviewed = reviewedProducts.has(order.id);
				const isHidden = order.hidden ?? false;
				const reviewDisabled = isReviewed || isHidden;

			return (
				<TableCell
				key={`actions-${order.id}`}
				bg={getRowBg(index)}
				>
				<div className="flex flex-row items-center size-full">
					<div className="box-border content-stretch flex gap-[16px] h-[40px] items-center px-[16px] py-[10px] relative w-full">
					<div
						onClick={() => handleResendMaterial(order.name, order.date)}
						className="relative shrink-0 size-[24px] cursor-pointer hover:opacity-70 transition-opacity"
						data-name="icon download"
						title="Повторно надіслати матеріал"
					>
						<div className="absolute inset-[16.667%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-4px] mask-size-[24px_24px]" data-name="download">
						<svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
							<path d={iconPaths.download} fill="var(--fill-0, #0D0D0D)" id="download" />
						</svg>
						</div>
					</div>
					<div
						onClick={() => handleOpenReview(order)}
						className={`relative shrink-0 size-[24px] transition-opacity ${
						reviewDisabled
							? 'opacity-30 cursor-not-allowed'
							: 'cursor-pointer hover:opacity-70'
						}`}
						data-name="comment"
						title={isHidden ? 'Матеріал недоступний' : isReviewed ? 'Ви вже залишили відгук' : 'Залишити відгук'}
					>
						<div className="absolute inset-[8.333%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2px] mask-size-[24px_24px]" data-name="comment">
						<svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
							<path d={iconPaths.comment} fill="var(--fill-0, #4D4D4D)" id="comment" />
						</svg>
						</div>
					</div>
					</div>
				</div>
				</TableCell>
			);
			}),
			...Array.from({ length: emptyRowsCount }, (_, index) => (
			<EmptyCell
				key={`empty-actions-${index}`}
				bg={getRowBg(orders.length + index)}
			/>
			))
		]
		}
	] : null;

	return (
		<div className="basis-0 content-stretch flex flex-col gap-[10px] grow h-full items-start min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
		{showReviewScreen && selectedOrder ? (
			<ReviewPanel
			materialName={selectedOrder.name}
			onClose={handleCloseReview}
			onSubmit={handleSubmitReview}
			/>
		) : (
			<div
			ref={tableContainerRef}
			className="bg-[#f2f2f2] box-border content-stretch flex gap-[12px] grow h-full w-full items-start overflow-clip px-[24px] relative rounded-[16px] shrink-0 px-[20px] py-[16px]"
			data-name="Scrolling Table"
			>
			{isLoading ? (
				<div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden w-full flex items-center justify-center">
					<div className="flex flex-col items-center justify-center w-full h-full gap-4">
						<div className="text-lg">Завантаження історії покупок...</div>
						<div className="space-y-4 w-full max-w-2xl">
							{[1, 2, 3, 4].map((i) => (
								<Skeleton key={i} className="h-16 w-full rounded-[12px]" />
							))}
						</div>
					</div>
				</div>
			) : error ? (
				<div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden w-full flex items-center justify-center">
					<div className="flex flex-col items-center justify-center w-full h-full gap-4 py-12">
						<div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative text-[#4d4d4d] text-[18px] text-center" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
							<p className="leading-[normal]">
								{error}
							</p>
						</div>
					</div>
				</div>
			) : boughtProducts.length === 0 ? (
				<div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden w-full flex items-center justify-center">
					<div className="flex flex-col items-center justify-center w-full h-full gap-4 py-12">
						<div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative text-[#4d4d4d] text-[18px] text-center" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
							<p className="leading-[normal]">
								Ви ще не здійснили жодної покупки
							</p>
						</div>
					</div>
				</div>
			) : (
				<div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden w-full" data-name="Table">
					<div className="content-stretch flex gap-[2px] items-start overflow-x-clip overflow-y-auto relative size-full rounded-[12px] w-full">
						{tableColumns && <Table columns={tableColumns} />}
					</div>
					<div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
				</div>
			)}
			</div>
		)}
		</div>
	);
}
