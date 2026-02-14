![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Vite](https://img.shields.io/badge/Vite-4.x-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38B2AC)

# MuzaLife Front End

Frontend application for MuzaLife - a modern web experience powered by React and Vite.

This repository contains the source code for the client-side of the MuzaLife project. It provides UI, routing, styles, and integration with backend (APIs) used by the MuzaLife ecosystem.


## Features

Built with:
- React 18 (component-based UI)
- Vite development server
- TypeScript for type safety
- Tailwind and CSS modules for styling
- Modular, scalable frontend architecture


## Getting Started

These instructions will help you get a development version running on your local machine.

### Prerequisites

Make sure you have Node.js v16+ and npm installed.

### Clone & Install

```
git clone https://github.com/VladimiKoroviakov/muzalife_frontend.git
cd muzalife_frontend
npm install
```


## Project Structure

```
src/
├── assets/          # Static assets (images, icons, fonts, media files)
├── components/      # Reusable UI components (buttons, modals, inputs, layouts)
├── config/          # Application configuration (env mapping, app settings)
├── constants/       # Global constants and enums (routes, roles, labels)
├── context/         # React Context providers (auth)
├── hooks/           # Custom React hooks (useAuth, useFAQs, useSingleProduct, useVerificationCode)
├── lib/             # Shared libraries and wrappers (API clients, helpers)
├── pages/           # Page-level components mapped to routes
├── services/        # Business logic and external integrations (API services)
├── styles/          # Global styles, Tailwind config, theme definitions
├── utils/           # Pure utility functions (formatters, validators)
├── App.tsx          # Application root component
├── index.css        # Global CSS entry point
├── main.tsx         # Application entry point (ReactDOM render)
├── types.ts         # Global TypeScript types and interfaces
```


## Configuration

Environment Variables

Create a `.env` file in the project root:

```
#API Base URL
VITE_API_URL=your_api_base_url_here

#Application Name
VITE_APP_NAME=MuzaLife

#Authentication Keys
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_FACEBOOK_APP_ID=your_facebook_client_id_here
```

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.


## Contributing

Contributions are welcome! Follow these steps:
1.	Fork it
2.	Create your feature branch (git checkout -b feature/your-feature)
3.	Commit your changes
4.	Push to your branch
5.	Open a Pull Request

Please make sure your code follows existing style conventions and includes relevant tests when applicable.


## Contact

If you want to reach out:
- GitHub: https://github.com/VladimiKoroviakov
- Email: v.korovyakov@student.sumdu.edu.ua


## License

This project is licensed under the MIT License - see the LICENSE file for details.


## Support

If you found this project useful, give it a ⭐ on GitHub!