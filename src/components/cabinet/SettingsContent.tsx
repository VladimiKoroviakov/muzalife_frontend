import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { apiService } from "../../services/api";
import { Skeleton } from "../ui/skeleton";
import { AuthUser } from "../../types";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import svgPaths from "../ui/icons/svgIconPaths";
import { VerificationCodeModal } from "../auth/VerificationModal";

interface SettingsContentProps {
  onShowFAQ: () => void;
}

export function SettingsContent({ onShowFAQ }: SettingsContentProps) {
  const [userName, setUserName] = useState("Користувач");
  const [userEmail, setUserEmail] = useState("example@email.com");
  const [userImage, setUserImage] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  const userInitials = userName
    .split(' ')
    .filter(word => word.length > 0)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('');
  
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [editPasswordOpen, setEditPasswordOpen] = useState(false);
  const [editImageOpen, setEditImageOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const [emailChangePending, setEmailChangePending] = useState<{
    newEmail: string;
  } | null>(null);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  
  const [tempName, setTempName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEmailPasswordUser = authProvider === 'email';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const cached = localStorage.getItem('userProfile');
        if (cached) {
          try {
            const profile: AuthUser = JSON.parse(cached);
            setUserName(profile.name);
            setUserEmail(profile.email);
            setUserImage(profile.avatar_url ?? null);
            setAuthProvider(profile.auth_provider ?? null);
            setIsLoadingProfile(false);
            return;
          } catch (e) {
            console.warn('Error parsing cached profile:', e);
            localStorage.removeItem('userProfile');
          }
        }

        const profile: AuthUser = await apiService.getProfile();

        // save in cache
        localStorage.setItem('userProfile', JSON.stringify(profile));

        setUserName(profile.name);
        setUserEmail(profile.email);
        setUserImage(profile.avatar_url ?? null);
        setAuthProvider(profile.auth_provider ?? null);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditName = () => {
    setTempName(userName);
    setEditNameOpen(true);
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      toast.error("Будь ласка, введіть ім'я");
      return;
    }

    try {
      const response = await apiService.updateName(tempName);

      if (response.success) {
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          try {
            const profile = JSON.parse(cachedProfile);
            profile.name = tempName;
            localStorage.setItem('userProfile', JSON.stringify(profile));
          } catch (e) {
            console.log('Error updating cached profile:', e);
          }
        }

        setUserName(tempName);
        setEditNameOpen(false);
        toast.success("Ім'я успішно оновлено!");
      } else {
        toast.error("Не вдалося оновити ім'я");
      }
    } catch (error) {
      console.log('Error saving name:', error);
      toast.error("Помилка при оновленні імені");
    }
  };

  const handleEditEmail = () => {
    if (!isEmailPasswordUser) {
      toast.error("Email не може бути змінено для користувачів, зареєстрованих через соціальні мережі");
      return;
    }

    setTempEmail(userEmail);
    setEditEmailOpen(true);
  };

  const handleSaveEmail = async () => {
    if (!tempEmail.trim()) {
      toast.error("Будь ласка, введіть email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(tempEmail)) {
      toast.error("Будь ласка, введіть дійсну email адресу");
      return;
    }

    let userId: number | null = null;
    const cachedProfile = localStorage.getItem('userProfile');
    if (cachedProfile) {
      try {
        const profile = JSON.parse(cachedProfile);
        userId = profile.id; // now userId is available below
      } catch (e) {
        console.log('Error parsing cached profile for user ID:', e);
      }
    }

    if (!userId) {
      toast.error("Не вдалося знайти ваш профіль");
      return;
    }

    try {
      const response = await apiService.initiateEmailChange(tempEmail, userId);

      if (response.success) {
        setEmailChangePending({ newEmail: tempEmail });
        setShowEmailVerificationModal(true);

        toast.success("На ваш новий email надіслано код підтвердження");
        setEditEmailOpen(false);
      } else {
        toast.error(response.error || "Не вдалося оновити email");
      }
    } catch (error) {
      console.log('Error saving email:', error);
      toast.error("Помилка при оновленні email");
    }
  };

  const handleVerifyEmailChange = async (code: string) => {

    let userId: number | null = null;
    const cachedProfile = localStorage.getItem('userProfile');
    if (cachedProfile) {
      try {
        const profile = JSON.parse(cachedProfile);
        userId = profile.id;
      } catch (e) {
        console.log('Error parsing cached profile for user ID:', e);
      }
    }

    if (!emailChangePending) return;
    if (!userId) {
      toast.error("Не вдалося знайти ваш профіль");
      return;
    }

    const result = await apiService.verifyEmailChange(
      code, 
      emailChangePending.newEmail, 
      userId
    );
    
    if (!result.success) {
      throw new Error(result.error || "Невірний код");
    }

    setUserEmail(emailChangePending.newEmail);

    const cached = localStorage.getItem("userProfile");
    if (cached) {
      const profile = JSON.parse(cached);
      profile.email = emailChangePending.newEmail;
      localStorage.setItem("userProfile", JSON.stringify(profile));
    }

    setEmailChangePending(null);
    setShowEmailVerificationModal(false);
  };

  const handleEditPassword = () => {
    if (!isEmailPasswordUser) {
      toast.error("Пароль не може бути змінено для користувачів, зареєстрованих через соціальні мережі");
      return;
    }

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setEditPasswordOpen(true);
  };

  const handleSavePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Будь ласка, заповніть всі поля");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Пароль має бути мінімум 6 символів");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Паролі не співпадають");
      return;
    }

    try {
      const response = await apiService.changePassword(oldPassword, newPassword);

      if (response.success) {
        setEditPasswordOpen(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Пароль успішно змінено!");
      } else {
        toast.error(response.error || "Не вдалося змінити пароль");
      }
    } catch (error) {
      console.log('Error changing password:', error);
      toast.error("Помилка при зміні пароля");
    }
  };

  const handleEditImage = () => {
    setEditImageOpen(true);
  };

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [userImage]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await apiService.uploadProfileImage(file);

      if (response.success && response.imageUrl) {
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          try {
            const profile = JSON.parse(cachedProfile);
            profile.imageUrl = response.imageUrl;
            localStorage.setItem('userProfile', JSON.stringify(profile));
          } catch (e) {
            console.log('Error updating cached profile:', e);
          }
        }

        setUserImage(response.imageUrl);
        toast.success("Зображення успішно оновлено!");
      } else {
        toast.error("Не вдалося завантажити зображення");
      }
    } catch (error) {
      console.log('Error uploading image:', error);
      toast.error("Помилка при завантаженні зображення");
    }
  };

  const handleRemoveImage = async () => {
    try {
      const response = await apiService.removeProfileImage();

      if (response.success) {
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          try {
            const profile = JSON.parse(cachedProfile);
            delete profile.imageUrl;
            localStorage.setItem('userProfile', JSON.stringify(profile));
          } catch (e) {
            console.log('Error updating cached profile:', e);
          }
        }

        setUserImage(null);
        toast.success("Зображення видалено");
      } else {
        toast.error("Не вдалося видалити зображення");
      }
    } catch (error) {
      console.log('Error removing image:', error);
      toast.error("Помилка при видаленні зображення");
    }
  };

  const handleDeleteAccount = () => {
    setDeleteEmailConfirm("");
    setDeleteAccountOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteEmailConfirm !== userEmail) {
      toast.error("Email не співпадає");
      return;
    }

    try {
      const response = await apiService.deleteAccount();

      if (response.success) {
        toast.success("Кабінет успішно видалено");
        setDeleteAccountOpen(false);

        localStorage.removeItem('userProfile');
        localStorage.removeItem('polls_cache');
        localStorage.removeItem('authToken');
        localStorage.removeItem('saved_products');

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(response.error || "Не вдалося видалити кабінет");
      }
    } catch (error) {
      console.log('Error deleting account:', error);
      toast.error("Помилка при видаленні кабінету");
    }
  };

  return (
    <>
      <div className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
        <div className="size-full">
          <div className="box-border content-stretch flex flex-col gap-[36px] items-start relative size-full h-full py-[24px] px-[20px] py-[16px]">
            {isLoadingProfile ? (
              /* Loading Skeleton */
              <>
                {/* Person section skeleton */}
                <div className="box-border content-stretch flex flex-col gap-[32px] items-center justify-center px-0 py-[48px] relative shrink-0 w-full" data-name="Person">
                  {/* Image skeleton */}
                  <Skeleton className="size-[160px] rounded-full" />
                  {/* Name skeleton */}
                  <Skeleton className="h-[36px] w-[200px]" />
                </div>
                {/* Info skeleton */}
                <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[12px] shrink-0 w-full" data-name="Info">
                  <div className="size-full">
                    <div className="box-border content-stretch flex flex-col items-start justify-between p-[20px] relative size-full">
                      {/* Top */}
                      <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
                        {/* Row */}
                        <div className="content-stretch flex gap-[20px] items-start relative shrink-0 w-full">
                          <Skeleton className="basis-0 grow h-[52px] rounded-[12px]" />
                          <Skeleton className="basis-0 grow h-[52px] rounded-[12px]" />
                        </div>
                      </div>
                      {/* Bottom buttons skeleton */}
                      <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
                        <Skeleton className="h-[44px] w-[180px] rounded-[12px]" />
                        <Skeleton className="h-[44px] w-[280px] rounded-[12px]" />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Loaded content */
              <>
                {/* Person section */}
                <div className="box-border content-stretch flex flex-col gap-[32px] items-center justify-center px-0 py-[48px] relative shrink-0 w-full" data-name="Person">
                  {/* Change image */}
                  <div className="content-stretch flex items-end justify-end relative shrink-0 size-[160px]" data-name="Change image">
                    {/* Image */}
                    <div className="basis-0 bg-white grow h-full min-h-px min-w-px relative rounded-[100px] shrink-0 overflow-hidden" data-name="Image">
                      <div aria-hidden="true" className="absolute border border-[#4d4d4d] border-solid inset-0 pointer-events-none rounded-[100px]" />
                      
                      {/* Fallback initials - shown when no image, image error, or while loading */}
                      {(!userImage || imageError) && (
                        <div className="flex flex-col items-center justify-center size-full">
                          <div className="box-border content-stretch flex flex-col gap-[12px] items-center justify-center px-[12px] py-[24px] relative size-full">
                            <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] h-[44px] justify-center leading-[0] relative shrink-0 text-[#4d4d4d] text-[48px] text-center w-[80px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                              <p className="leading-[20px]">{userInitials}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Image - hidden while loading or if there's an error */}
                      {userImage && !imageError && (
                        <img 
                          src={userImage} 
                          alt="Profile" 
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover transition-opacity duration-300 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                          }`}
                          onError={() => {
                            setImageError(true);
                            setImageLoaded(false);
                          }}
                          onLoad={() => {
                            setImageLoaded(true);
                            setImageError(false);
                          }}
                          loading="lazy"
                        />
                      )}
                    </div>
                    {/* Edit button */}
                    <div onClick={handleEditImage} className="absolute bg-[#e6e6e6] box-border content-stretch flex gap-[10px] items-center justify-center left-[125.5px] p-[4px] rounded-[20px] top-[122px] cursor-pointer hover:opacity-80 transition-opacity" data-name="edit">
                      <div aria-hidden="true" className="absolute border border-[#4d4d4d] border-solid inset-0 pointer-events-none rounded-[20px]" />
                      <div className="relative shrink-0 size-[20px]" data-name="frame_person">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                          <g id="frame_person">
                            <mask height="20" id="mask0_63_1062" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
                              <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
                            </mask>
                            <g mask="url(#mask0_63_1062)">
                              <path d={svgPaths.pe8e3e00} fill="var(--fill-0, #4D4D4D)" id="frame_person_2" />
                            </g>
                          </g>
                        </svg>
                      </div>
                    </div>
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  {/* Name */}
                  <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0" data-name="Name">
                    <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[36px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                      <p className="leading-[20px] whitespace-pre">{userName}</p>
                    </div>
                    <div onClick={handleEditName} className="relative shrink-0 size-[24px] cursor-pointer hover:opacity-70 transition-opacity" data-name="icon edit">
                      <div className="absolute inset-[12.5%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px] mask-size-[24px_24px]" data-name="edit">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                          <path d={svgPaths.p377f500} fill="var(--fill-0, #4D4D4D)" id="edit" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Info */}
                <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[12px] shrink-0 w-full" data-name="Info">
                  <div className="size-full">
                    <div className="box-border content-stretch flex flex-col items-start justify-between p-[20px] relative size-full">
                      {/* Top */}
                      <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-name="Top">
                        {/* Row */}
                        <div className="content-stretch flex gap-[20px] items-start relative shrink-0 w-full" data-name="row">
                          {/* Email field */}
                          <div className="basis-0 bg-[#f2f2f2] grow h-[52px] min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Select Form field">
                            <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
                            <div className="flex flex-row items-center size-full">
                              <div className="box-border content-stretch flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative w-full">
                                <div className="basis-0 flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] grow justify-end leading-[0] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                                  <p className="[white-space-collapse:collapse] leading-[normal] overflow-ellipsis overflow-hidden">{userEmail}</p>
                                </div>
                                <div 
                                  onClick={isEmailPasswordUser ? handleEditEmail : undefined} 
                                  className={`relative shrink-0 size-[24px] z-10 ${isEmailPasswordUser 
                                      ? 'cursor-pointer hover:opacity-70 transition-opacity' 
                                      : 'cursor-default tooltip-hover'}`}                                  
                                  data-name="icon edit"
                                  data-tooltip={!isEmailPasswordUser ? "Email не може бути змінено для користувачів, зареєстрованих через google або facebook" : undefined}
                                >
                                  <div 
                                    className="absolute inset-[12.5%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px] mask-size-[24px_24px]" 
                                    data-name="edit"
                                    style={{ opacity: isEmailPasswordUser ? 1 : 0.5 }}
                                    >
                                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                                      <path d={svgPaths.p377f500} fill="var(--fill-0, #4D4D4D)" id="edit" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Password field */}
                          <div className="basis-0 bg-[#f2f2f2] grow h-[52px] min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Select Form field">
                            <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
                            <div className="flex flex-row items-center size-full">
                              <div className="box-border content-stretch flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative w-full">
                                <div className="basis-0 flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] grow justify-end leading-[0] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                                  <p className="[white-space-collapse:collapse] leading-[normal] overflow-ellipsis overflow-hidden">Пароль</p>
                                </div>
                                <div 
                                  onClick={isEmailPasswordUser ? handleEditPassword : undefined} 
                                  className={`relative shrink-0 size-[24px] z-10 ${isEmailPasswordUser 
                                      ? 'cursor-pointer hover:opacity-70 transition-opacity' 
                                      : 'cursor-default tooltip-hover'}`}
                                  data-name="icon edit"
                                  data-tooltip={!isEmailPasswordUser ? "Пароль не може бути змінено для користувачів, зареєстрованих через google або facebook" : undefined}
                                  >
                                  <div 
                                  className="absolute inset-[12.5%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px] mask-size-[24px_24px]" 
                                  data-name="edit"
                                  style={{ opacity: isEmailPasswordUser ? 1 : 0.5 }}
                                  >
                                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                                      <path d={svgPaths.p377f500} fill="var(--fill-0, #4D4D4D)" id="edit" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Bottom buttons */}
                      <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="row">
                        {/* Delete account button */}
                        <div onClick={handleDeleteAccount} className="bg-white box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-[#f9f9f9] transition-colors" data-name="Button">
                          <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#e53935] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                            <p className="leading-[normal] whitespace-pre">Видалити кабінет</p>
                          </div>
                        </div>
                        {/* FAQ button */}
                        <div onClick={onShowFAQ} className="bg-white box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-[#f9f9f9] transition-colors" data-name="Button">
                          <div aria-hidden="true" className="absolute border border-[#4d4d4d] border-solid inset-0 pointer-events-none rounded-[12px]" />
                          <div className="relative shrink-0 size-[20px]" data-name="icon help">
                            <div className="absolute aspect-[23.3333/23.3333] left-[8.33%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2.333px] mask-size-[28px_28px] right-[8.33%] top-1/2 translate-y-[-50%]" data-name="help">
                              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
                                <path d={svgPaths.p2bd81d00} fill="var(--fill-0, #0D0D0D)" id="help" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                            <p className="leading-[normal] whitespace-pre">Найпоширеніші запитання</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Name Dialog */}
     <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редагувати ім'я</DialogTitle>
          <DialogDescription>
            Введіть нове ім'я користувача (максимум 255 символів)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Повне ім'я</Label>
            <Input
              id="name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Введіть ваше ім'я"
              maxLength={256} // 255 + 1 to show when limit is reached
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {tempName.trim().length === 0 && "Ім'я не може бути порожнім"}
              </span>
              <span className={tempName.length > 255 ? "text-red-500" : ""}>
                {tempName.length}/255
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditNameOpen(false)} className="cursor-pointer">
            Скасувати
          </Button>
          <Button 
            onClick={handleSaveName} 
            className="cursor-pointer"
            disabled={tempName.trim().length === 0 || tempName.length > 255}
          >
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

      {/* Edit Email Dialog */}
      <Dialog open={editEmailOpen} onOpenChange={setEditEmailOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редагувати email</DialogTitle>
            <DialogDescription>
              Введіть нову адресу електронної пошти
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEmailOpen(false)} className="cursor-pointer">
              Скасувати
            </Button>
            <Button onClick={handleSaveEmail} className="cursor-pointer">Продовжити</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Password Dialog */}
      <Dialog open={editPasswordOpen} onOpenChange={setEditPasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Змінити пароль</DialogTitle>
            <DialogDescription>
              Введіть старий та новий пароль
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="old-password">Старий пароль</Label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Введіть старий пароль"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Новий пароль</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Введіть новий пароль"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Підтвердіть пароль</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Підтвердіть новий пароль"
              />
            </div>
            {newPassword !== confirmPassword && confirmPassword && (
              <p className="text-sm text-red-500">Паролі не співпадають</p>
            )}
            {newPassword.length > 0 && newPassword.length < 6 && (
              <p className="text-sm text-red-500">Пароль має бути мінімум 6 символів</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPasswordOpen(false)} className="cursor-pointer">
              Скасувати
            </Button>
            <Button 
              onClick={handleSavePassword}
              disabled={newPassword !== confirmPassword || newPassword.length < 6}
              className="cursor-pointer"
            >
              Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Image Dialog */}
      <Dialog open={editImageOpen} onOpenChange={setEditImageOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редагувати зображення профілю</DialogTitle>
            <DialogDescription>
              Завантажте зображення профілю. Якщо зображення не завантажено, буде відображено перші літери вашого імені та прізвища.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {userImage && (
              <div className="grid gap-2">
                <Label>Поточне зображення</Label>
                <div className="flex items-center gap-4">
                  <img 
                    src={userImage} 
                    alt="Current profile" 
                    className="w-20 h-20 rounded-full object-cover border border-[#4d4d4d]"
                  />
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleRemoveImage}
                    className="cursor-pointer"
                  >
                    Видалити зображення
                  </Button>
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Завантажити зображення</Label>
              <Button 
                variant="outline" 
                onClick={handleFileSelect}
                className="w-full cursor-pointer"
              >
                Вибрати файл
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditImageOpen(false)} className="cursor-pointer">
              Закрити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Видалити кабінет</DialogTitle>
            <DialogDescription>
              Ця дія незворотна. Будь ласка, введіть вашу адресу email для підтвердження видалення.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="confirm-email">Підтвердіть email</Label>
              <Input
                id="confirm-email"
                type="email"
                value={deleteEmailConfirm}
                onChange={(e) => setDeleteEmailConfirm(e.target.value)}
                placeholder={userEmail}
              />
            </div>
            {deleteEmailConfirm && deleteEmailConfirm !== userEmail && (
              <p className="text-sm text-red-500">Email не співпадає</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAccountOpen(false)} className="cursor-pointer">
              Скасувати
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteEmailConfirm !== userEmail}
              className="cursor-pointer"
            >
              Видалити кабінет
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Verification Modal */}
      {emailChangePending && (
      <VerificationCodeModal
        email={emailChangePending.newEmail}
        isOpen={showEmailVerificationModal}
        title="Підтвердження нового email"
        description={`Введіть код, надісланий на ${emailChangePending.newEmail}`}
        submitLabel="Підтвердити email"
        successToast="Email успішно змінено!"
        onSubmit={handleVerifyEmailChange}
        onResend={() => apiService.resendEmailChangeCode(emailChangePending.newEmail)}
        onClose={() => {
          setShowEmailVerificationModal(false);
          setEmailChangePending(null);
        }}
      />
    )}
    </>
  );
}