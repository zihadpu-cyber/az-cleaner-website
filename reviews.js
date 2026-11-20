import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const form = document.getElementById("reviewForm");
if (form) {
  const statusEl = document.getElementById("reviewStatus");
  const listEl = document.getElementById("reviewList");
  const averageEl = document.getElementById("reviewAverage");
  const configReady = firebaseConfig.apiKey !== "PASTE_YOUR_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID";
  if (!configReady) {
    statusEl.textContent = "Reviews are not active yet. The website administrator needs to connect Firebase.";
    listEl.innerHTML = "<p>Customer reviews will appear here after setup and approval.</p>";
  } else {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const reviewsRef = collection(db, "reviews");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = document.getElementById("reviewName").value.trim();
      const rating = Number(document.getElementById("reviewRating").value);
      const message = document.getElementById("reviewMessage").value.trim();
      if (!name || !message || !Number.isInteger(rating) || rating < 1 || rating > 5) return;
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true; statusEl.textContent = "Submitting...";
      try {
        await addDoc(reviewsRef, { name, rating, message, status: "pending", createdAt: serverTimestamp() });
        form.reset(); statusEl.textContent = "Thank you! Your review has been submitted and is pending admin approval.";
      } catch (error) {
        console.error(error); statusEl.textContent = "Could not submit your review. Please try again later.";
      } finally { submit.disabled = false; }
    });
    const approvedQuery = query(reviewsRef, where("status", "==", "approved"), orderBy("createdAt", "desc"));
    onSnapshot(approvedQuery, (snapshot) => {
      const reviews = snapshot.docs.map(doc => doc.data());
      if (!reviews.length) { listEl.innerHTML = "<p>No approved reviews yet. Be the first to share your experience!</p>"; averageEl.textContent = "No ratings yet"; return; }
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      averageEl.textContent = ` ${avg.toFixed(1)} / 5  ★★★★★  (${reviews.length} reviews)`;
      listEl.replaceChildren();
      reviews.forEach(r => {
        const card = document.createElement("article"); card.className = "card"; card.style.cssText = "padding:18px;border-radius:14px;";
        const stars = document.createElement("div"); stars.textContent = "★".repeat(r.rating) + "☆".repeat(5-r.rating); stars.style.cssText = "color:#d39b00;font-size:20px;";
        const title = document.createElement("h3"); title.textContent = r.name;
        const body = document.createElement("p"); body.textContent = r.message;
        card.append(stars,title,body); listEl.append(card);
      });
    }, (error) => { console.error(error); listEl.textContent = "Unable to load reviews right now."; });
  }
}
