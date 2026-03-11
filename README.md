# AI-Powered Health & Wellness Monitoring App

This is a modern, AI-powered health and wellness dashboard using React, Vite, Tailwind CSS, Tree.js, and Firebase.

## Firebase Setup Instructions

To enable full application functionality such as user authentication and data storage, you must configure a Firebase project.

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Enter a project name (e.g., "WellnessApp"). Google Analytics is optional.
4. Click **Create project** and wait for it to finish.

### 2. Add a Web App to Firebase
1. On your project overview page, click the web icon (`</>`) to add Firebase to your web app.
2. Register the app with a nickname.
3. You will be provided with a `firebaseConfig` object containing keys like `apiKey`, `authDomain`, etc.
4. Copy these values.

### 3. Configure the Application
1. Open the file located at `src/firebase/firebaseConfig.js`.
2. Replace the placeholder values in the `firebaseConfig` object with your actual keys from Step 2.

### 4. Enable Authentication Methods
1. In the Firebase Console, navigate to **Build > Authentication** from the left sidebar.
2. Click **Get Started**.
3. Go to the **Sign-in method** tab.
4. Enable **Email/Password** and click Save.
5. Enable **Google** (you will need to provide a project support email) and click Save.

### 5. Enable Firestore Database (Optional but recommended)
1. Navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Start in **Test Mode** for local development (make sure to properly configure rules later).
4. Click **Enable**.

Now you can start the application using `npm run dev` and test the authentication!
