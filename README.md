# Benessere North Mental Health Tracker
This repository contains the code developed for Julissa Pacheco Garcia's, Cuong Mach's, Jack Maser's, and Shawn Peng's 2025-2026 ASU Capstone Project.

The mental health tracker is a website developed for tracking patient response to different depression treatments. To contribute to this project, create your own dev-branch and follow the directions for the sub-directories frontend and backend.

## Frontend
The frontend is hosted on a Cloudflare pages project. The code in the `frontend ` sub-directory is a [SvelteKit project](https://svelte.dev/docs/kit/introduction). To test frontend pages locally, use the following command:
```
npm run dev
```
If you want to test the frontend's connection to backend API calls, you must push your code to your dev branch and test directly on the team Cloudflare dashboard.

## Backend
The backend is hosted on a Cloudflare worker project. It is connected to a Supabase database where all our tables are located. The `backend` sub-directory is a [Hono project](https://hono.dev/docs/).

As of now, the backend cannot be tested locally. To test any changes to the backend you must deploy to your dev branch and then test directly on the team Cloudflare dashboard.

## Additional Resources

More details about this project and instructions on how to make basic changes to the project can be found in the following document(s):
* [Infrastructure Documentation](https://docs.google.com/document/d/1GuqRJYBsjcTTu2TDmC8PXRvm7VHyNvpDHrXvKuWTMXI/edit?usp=sharing)
* [Capstone Log](https://docs.google.com/document/d/11pgwaRBHwCwpui22Yh5y8fEmvGlmVogeUiXJFhD0aCs/edit?usp=sharing)
