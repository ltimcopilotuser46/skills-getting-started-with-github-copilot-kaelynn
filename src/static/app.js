document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants list with delete icon
        let participantsHtml = "";
        if (details.participants.length) {
          participantsHtml = details.participants.map(p =>
            `<li><span>${p}</span><button class="delete-participant-btn" title="Unregister" onclick="window.unregisterParticipant('${name}','${p}')">&#128465;</button></li>`
          ).join("");
        } else {
          participantsHtml = "<li><em>No participants yet</em></li>";
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <div class="participants-section">
            <h4>Participants (${details.participants.length}):</h4>
            <ul class="participants-list">
              ${participantsHtml}
            </ul>
          </div>
          <p style="margin-top:0.7em;font-size:0.93em;color:#64748b;">
            <strong>Availability:</strong> ${spotsLeft} spots left
          </p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Expose unregisterParticipant globally
  window.unregisterParticipant = async function(activityName, email) {
    if (!confirm(`Unregister ${email} from ${activityName}?`)) return;
    try {
      const response = await fetch(`/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`, {
        method: "POST"
      });
      const result = await response.json();
      if (response.ok) {
        fetchActivities();
      } else {
        alert(result.detail || "Failed to unregister participant.");
      }
    } catch (error) {
      alert("Error unregistering participant.");
      console.error(error);
    }
  };

  // Initialize app
  fetchActivities();
});
