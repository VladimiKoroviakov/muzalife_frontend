import { Product } from "../../types";
import Badge from "../ui/badge";

export function ProductTags({ product }: { product: Product }) {
  return (
    <div className="content-start flex flex-wrap gap-[16px] items-start relative rounded-[16px] shrink-0 w-full" data-name="Tags">
      <Badge text={product.type} />
      {Array.isArray(product.ageCategory) ? (
        product.ageCategory.map((age, index) => (
          <Badge key={index} text={age} />
        ))
      ) : (
        <Badge text={product.ageCategory} />
      )}
    </div>
  );
}