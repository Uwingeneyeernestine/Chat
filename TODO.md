# Task: Fix Login and Redirect to Layout.jsx

## Plan:
- [ ] Modify sign.jsx - Add login button, form validation (ernestine/me), and redirect to Layout.jsx
- [ ] Modify App.jsx - Add authentication state management
- [ ] Modify page.jsx - Remove login buttons (moved to sign.jsx)
- [ ] Test the application

## Implementation Steps:
1. sign.jsx: Add useState for username/password, add login button, add validation, add redirect
2. App.jsx: Add isLoggedIn state, pass to components, conditionally render Page or Layout
3. page.jsx: Remove login/register buttons and popup logic
