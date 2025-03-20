# Habit Bet - Track habits, set stakes, and achieve your goals

A comprehensive habit tracking app with monetary stakes to keep you accountable.

## Features

- Track habits with customizable frequency and duration
- Set monetary stakes for added accountability
- View detailed habit insights and analytics
- Receive notifications for missed check-ins
- Online payment processing with Polar.sh

## Polar.sh Integration

The application uses [Polar.sh](https://polar.sh) as the payment processor for premium subscriptions and habit stakes.

### Setup Instructions

1. Sign up for a Polar.sh account at https://polar.sh
2. Create an organization and obtain your organization ID
3. Create products in the Polar dashboard:
   - Free tier product
   - Premium subscription product with monthly and yearly price options
   - Habit stake payment product
4. Add the following environment variables to your `.env.local` file:
   ```
   NEXT_PUBLIC_POLAR_ORG_ID=your-organization-id
   NEXT_PUBLIC_POLAR_ACCESS_TOKEN=your-polar-api-token
   ```

### Key Integration Points

The Polar.sh integration is implemented in the following components:

- **Pricing Section**: Displays pricing tiers fetched from Polar.sh
- **Product Cards**: Display individual products from Polar.sh
- **Checkout Page**: Processes payments for products
- **Failed Habit Payment**: Handles stake payments when habits fail

## Development

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Installation

```
npm install
```

### Running the development server

```
npm run dev
```

### Building for production

```
npm run build
```

## License

[MIT](LICENSE)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
