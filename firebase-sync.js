import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPqVGVaji1lHjpgzB7IKFIUfOSiQZBKiA",
  authDomain: "tai-chi-db24a.firebaseapp.com",
  projectId: "tai-chi-db24a",
  storageBucket: "tai-chi-db24a.firebasestorage.app",
  messagingSenderId: "647392743702",
  appId: "1:647392743702:web:f3bcddbde5547768884037"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getFirestore(firebaseApp);

const gate = document.getElementById("auth-gate");
const form = document.getElementById("auth-form");
const title = document.getElementById("auth-title");
const intro = document.getElementById("auth-intro");
const nameField = document.getElementById("auth-name-field");
const nameInput = document.getElementById("auth-name");
const emailInput = document.getElementById("auth-email");
const passwordInput = document.getElementById("auth-password");
const submitButton = document.getElementById("auth-submit");
const switchButton = document.getElementById("auth-switch");
const resetButton = document.getElementById("auth-reset");
const message = document.getElementById("auth-message");

let createMode = false;
let activeUserId = null;
let pendingSave = null;
let latestState = null;
let pendingDisplayName = "";
let stopProgressListener = null;

function setMessage(text, success = false) {
  message.textContent = text;
  message.classList.toggle("success", success);
}

function setBusy(busy, label) {
  submitButton.disabled = busy;
  submitButton.textContent = busy ? label : (createMode ? "Create account" : "Sign in");
}

function setMode(shouldCreate) {
  createMode = shouldCreate;
  title.textContent = createMode ? "Create your account" : "Welcome back";
  intro.textContent = createMode
    ? "Your workouts, breathing sessions, and progress will stay with your account."
    : "Sign in to continue and keep your progress safely synced.";
  nameField.hidden = !createMode;
  nameInput.required = createMode;
  passwordInput.autocomplete = createMode ? "new-password" : "current-password";
  submitButton.textContent = createMode ? "Create account" : "Sign in";
  switchButton.textContent = createMode ? "Already have an account? Sign in" : "New here? Create an account";
  resetButton.hidden = createMode;
  setMessage("");
}

function friendlyAuthError(error) {
  const code = error?.code || "";
  if (code.includes("invalid-credential")) return "That email or password does not match. Please try again.";
  if (code.includes("email-already-in-use")) return "An account already uses that email. Try signing in instead.";
  if (code.includes("weak-password")) return "Please choose a stronger password with at least 6 characters.";
  if (code.includes("invalid-email")) return "Please enter a valid email address.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please wait a little while and try again.";
  if (code.includes("operation-not-allowed")) return "Email sign-in has not been enabled in Firebase yet.";
  return error?.message || "Something went wrong. Please try again.";
}

async function writeProgress(progressState) {
  if (!activeUserId) return;
  window.setCloudSyncStatus?.("Saving…");
  try {
    await setDoc(doc(database, "users", activeUserId), {
      displayName: auth.currentUser?.displayName || "",
      email: auth.currentUser?.email || "",
      state: progressState,
      schemaVersion: 1,
      updatedAt: serverTimestamp()
    }, { merge: true });
    window.setCloudSyncStatus?.("Saved to your account");
  } catch (error) {
    console.error("Cloud save failed", error);
    window.setCloudSyncStatus?.("Saved on this device — cloud unavailable");
  }
}

window.cloudProgress = {
  save(progressState) {
    latestState = JSON.parse(JSON.stringify(progressState));
    clearTimeout(pendingSave);
    pendingSave = setTimeout(() => writeProgress(latestState), 450);
  },
  async signOut() {
    clearTimeout(pendingSave);
    if (latestState) await writeProgress(latestState);
    await signOut(auth);
  },
  async loadUsers() {
    const snapshot = await getDocs(collection(database, "users"));
    return snapshot.docs.map(memberDocument => {
      const data = memberDocument.data();
      return {
        id: memberDocument.id,
        displayName: data.displayName || "",
        email: data.email || "",
        state: data.state || null
      };
    }).sort((left, right) => (left.displayName || left.email).localeCompare(right.displayName || right.email));
  },
  async updateUserState(userId, progressState) {
    await setDoc(doc(database, "users", userId), {
      state: progressState,
      schemaVersion: 1,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
};

form.addEventListener("submit", async event => {
  event.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  setMessage("");
  setBusy(true, createMode ? "Creating account…" : "Signing in…");

  try {
    if (createMode) {
      const firstName = nameInput.value.trim();
      if (!firstName) throw new Error("Please enter your first name.");
      pendingDisplayName = firstName;
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: firstName });
      window.setSignedInIdentity?.({ displayName: firstName, email });
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    setMessage(friendlyAuthError(error));
    setBusy(false);
  }
});

switchButton.addEventListener("click", () => setMode(!createMode));

resetButton.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) {
    setMessage("Enter your email above first, then choose Forgot password.");
    emailInput.focus();
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    setMessage("Password reset email sent. Please check your inbox.", true);
  } catch (error) {
    setMessage(friendlyAuthError(error));
  }
});

await setPersistence(auth, browserLocalPersistence);

onAuthStateChanged(auth, async user => {
  if (!user) {
    if (stopProgressListener) stopProgressListener();
    stopProgressListener = null;
    activeUserId = null;
    latestState = null;
    window.setAdminAccess?.(false);
    document.body.classList.add("auth-pending");
    gate.hidden = false;
    setBusy(false);
    setMode(false);
    return;
  }

  activeUserId = user.uid;
  setMessage("Loading your progress…", true);
  let remoteState = null;
  let isAdministrator = false;

  try {
    const [progressSnapshot, adminSnapshot] = await Promise.all([
      getDoc(doc(database, "users", user.uid)),
      getDoc(doc(database, "admins", user.uid))
    ]);
    if (progressSnapshot.exists()) remoteState = progressSnapshot.data().state || null;
    isAdministrator = adminSnapshot.exists();
  } catch (error) {
    console.error("Cloud load failed", error);
  }

  const activatedState = window.activateUserProgress?.(user.uid, remoteState, {
    displayName: user.displayName || pendingDisplayName,
    email: user.email
  });
  pendingDisplayName = "";
  latestState = activatedState || null;
  gate.hidden = true;
  document.body.classList.remove("auth-pending");
  window.setAdminAccess?.(isAdministrator);
  setBusy(false);

  if (activatedState) await writeProgress(activatedState);

  if (stopProgressListener) stopProgressListener();
  stopProgressListener = onSnapshot(doc(database, "users", user.uid), snapshot => {
    const remoteProgress = snapshot.exists() ? snapshot.data().state : null;
    if (remoteProgress && window.applyRemoteProgress?.(remoteProgress)) {
      latestState = remoteProgress;
      window.setCloudSyncStatus?.("Updated by an administrator");
    }
  }, error => {
    console.error("Progress listener failed", error);
  });
});
