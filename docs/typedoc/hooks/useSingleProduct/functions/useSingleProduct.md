[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [hooks/useSingleProduct](../README.md) / useSingleProduct

# Function: useSingleProduct()

> **useSingleProduct**(`id`): `UseSingleProduct`

Defined in: [hooks/useSingleProduct.ts:38](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/9132c6f38e60cc59590a5f3ade3be7eda2209c95/src/hooks/useSingleProduct.ts#L38)

Fetches a product and its reviews by product ID.

**Algorithm:**
1. Fetches the product from `GET /api/products/:id`.
2. Deduplicates the gallery images (main image + additional images).
3. Fetches reviews from `GET /api/reviews/product/:id`.
   - Reviews errors are swallowed — a missing review list never blocks
     the product page from rendering.

**Interaction:** the `refetch` function is exposed so that after a user
submits a new review the page can reload without a full browser refresh.

## Parameters

### id

`string` \| `undefined`

The product ID as a string (from `useParams`), or `undefined`
            while the route is still resolving.

## Returns

`UseSingleProduct`

State object with the product, reviews, gallery images, loading
         flag, error message, and a `refetch` callback.

## Example

```ts
function SingleProductPage() {
  const { id } = useParams<{ id: string }>();
  const { product, reviews, loading, error, refetch } = useSingleProduct(id);
  // ...
}
```
