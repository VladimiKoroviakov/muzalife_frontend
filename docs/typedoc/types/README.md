[**MuzaLife Frontend v0.1.0**](../README.md)

***

[MuzaLife Frontend](../modules.md) / types

# types

## Fileoverview

Global TypeScript types and interfaces for the MuzaLife frontend.

This module is the single source of truth for all shared data shapes used
across components, hooks, services, and pages.

**Conventions:**
- Types that mirror a backend entity (product, user, review, …) are named
  after the entity.
- Component prop types are suffixed with `Props` (e.g. `ProductCardProps`).
- Hook return types are suffixed with the hook name (e.g. `UseSingleProduct`).
- API response envelopes are suffixed with `ApiResponse`.

## Interfaces

- [ApiPoll](interfaces/ApiPoll.md)
- [ApiResponse](interfaces/ApiResponse.md)
- [AuthLogoTitleProps](interfaces/AuthLogoTitleProps.md)
- [AuthResponse](interfaces/AuthResponse.md)
- [AuthState](interfaces/AuthState.md)
- [BoughtScenariosContentProps](interfaces/BoughtScenariosContentProps.md)
- [CloseButtonProps](interfaces/CloseButtonProps.md)
- [CreatePersonalOrderData](interfaces/CreatePersonalOrderData.md)
- [ErrorStateProps](interfaces/ErrorStateProps.md)
- [FAQItem](interfaces/FAQItem.md)
- [HelpProps](interfaces/HelpProps.md)
- [IconBookmarksProps](interfaces/IconBookmarksProps.md)
- [LocalMallProps](interfaces/LocalMallProps.md)
- [LoginResponse](interfaces/LoginResponse.md)
- [OptionProps](interfaces/OptionProps.md)
- [OptionsProps](interfaces/OptionsProps.md)
- [Order](interfaces/Order.md)
- [PersonalOrder](interfaces/PersonalOrder.md)
- [PersonalOrdersApiResponse](interfaces/PersonalOrdersApiResponse.md)
- [Poll](interfaces/Poll.md)
- [PollCardProps](interfaces/PollCardProps.md)
- [PollDetailsResponse](interfaces/PollDetailsResponse.md)
- [PollsResponse](interfaces/PollsResponse.md)
- [QuestionProps](interfaces/QuestionProps.md)
- [RegistrationResponse](interfaces/RegistrationResponse.md)
- [Review](interfaces/Review.md)
- [RowProps](interfaces/RowProps.md)
- [SavedScenariosContentProps](interfaces/SavedScenariosContentProps.md)
- [SocialLoginResponse](interfaces/SocialLoginResponse.md)
- [UpdatePersonalOrderData](interfaces/UpdatePersonalOrderData.md)
- [UseFAQsReturn](interfaces/UseFAQsReturn.md)
- [UserProfileApiResponse](interfaces/UserProfileApiResponse.md)
- [UserProfileData](interfaces/UserProfileData.md)
- [UseSingleProduct](interfaces/UseSingleProduct.md)
- [VotedCardProps](interfaces/VotedCardProps.md)
- [VoterData](interfaces/VoterData.md)
- [VoteRequest](interfaces/VoteRequest.md)
- [VoteResponse](interfaces/VoteResponse.md)
- [VotersProps](interfaces/VotersProps.md)
- [VotesProps](interfaces/VotesProps.md)

## Type Aliases

- [AuthUser](type-aliases/AuthUser.md)
- [Product](type-aliases/Product.md)
- [ProductCardProps](type-aliases/ProductCardProps.md)
