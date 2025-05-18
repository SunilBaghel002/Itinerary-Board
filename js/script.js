class ItineraryBoard {
  constructor() {
    this.trips = [];
    this.currentTripId = null;
    this.currentDayId = null;
    this.currentActivityId = null;
    this.sortables = [];
    this.chart = null;
    this.currentChartType = "pie";
    this.notificationTimeouts = [];
    this.initElements();
    this.loadFromLocalStorage();
    document.body.classList.add("dark-theme");
    this.setupEventListeners();
    this.requestNotificationPermission();
    this.renderLandingPage();
    this.renderSidebar();
    this.scheduleAllReminders();
    if (window.innerWidth > 768) {
      this.sidebar.classList.remove("hidden");
      this.mainContent.classList.remove("full-width");
    }
  }

  initElements() {
    this.landingPage = document.getElementById("landingPage");
    this.itineraryPage = document.getElementById("itineraryPage");
    this.summaryPage = document.getElementById("summaryPage");
    this.budgetPage = document.getElementById("budgetPage");
    this.ongoingTripList = document.getElementById("ongoingTripList");
    this.completedTripList = document.getElementById("completedTripList");
    this.addTripSidebarBtn = document.getElementById("addTripSidebarBtn");
    this.historyList = document.getElementById("historyList");
    this.ongoingList = document.getElementById("ongoingList");
    this.boardElement = document.getElementById("board");
    this.tripTitleElement = document.getElementById("tripTitle");
    this.addTripModal = document.getElementById("addTripModal");
    this.addDayModal = document.getElementById("addDayModal");
    this.addActivityModal = document.getElementById("addActivityModal");
    this.saveNotification = document.getElementById("saveNotification");
    this.summaryTitle = document.getElementById("summaryTitle");
    this.summaryStats = document.getElementById("summaryStats");
    this.activityList = document.getElementById("activityList");
    this.budgetSummary = document.getElementById("budgetSummary");
    this.completionChart = document.getElementById("completionChart");
    this.budgetTitle = document.getElementById("budgetTitle");
    this.budgetStats = document.getElementById("budgetStats");
    this.budgetList = document.getElementById("budgetList");
    this.showPieChartBtn = document.getElementById("showPieChart");
    this.showBarChartBtn = document.getElementById("showBarChart");
    this.showLineChartBtn = document.getElementById("showLineChart");
    this.hamburgerBtn = document.querySelector(".hamburger");
    this.sidebar = document.querySelector(".sidebar");
    this.mainContent = document.querySelector(".main-content");

    this.tripForm = document.getElementById("tripForm");
    this.dayForm = document.getElementById("dayForm");
    this.activityForm = document.getElementById("activityForm");

    this.tripTitleInput = document.getElementById("tripTitleInput");
    this.tripDestinationInput = document.getElementById("tripDestination");
    this.tripDatesInput = document.getElementById("tripDates");
    this.dayTitleInput = document.getElementById("dayTitle");
    this.dayDateInput = document.getElementById("dayDate");
    this.editDayIdInput = document.getElementById("editDayId");
    this.activityTimeInput = document.getElementById("activityTime");
    this.activityTitleInput = document.getElementById("activityTitle");
    this.activityCostInput = document.getElementById("activityCost");
    this.activityDescriptionInput = document.getElementById(
      "activityDescription"
    );
    this.activityLocationInput = document.getElementById("activityLocation");
    this.activityCategoryInput = document.getElementById("activityCategory");
    this.activityNotesInput = document.getElementById("activityNotes");
    this.activityLatitudeInput = document.getElementById("activityLatitude");
    this.activityLongitudeInput = document.getElementById("activityLongitude");
    this.activityReminderInput = document.getElementById("activityReminder");
    this.dayIdInput = document.getElementById("dayId");
    this.activityIdInput = document.getElementById("activityId");

    this.addTripBtn = document.getElementById("addTripBtn");
    this.saveItineraryBtn = document.getElementById("saveItinerary");
    this.viewBudgetBtn = document.getElementById("viewBudget");
    this.exportItineraryBtn = document.getElementById("exportItinerary");
    this.completeTripBtn = document.getElementById("completeTrip");
    this.backToLandingBtn = document.getElementById("backToLanding");
    this.backToItineraryBtn = document.getElementById("backToItinerary");
    this.exportSummaryBtn = document.getElementById("exportSummary");
    this.saveTripBtn = document.getElementById("saveTrip");
    this.cancelTripBtn = document.getElementById("cancelTrip");
    this.saveDayBtn = document.getElementById("saveDay");
    this.cancelDayBtn = document.getElementById("cancelDay");
    this.saveActivityBtn = document.getElementById("saveActivity");
    this.cancelActivityBtn = document.getElementById("cancelActivity");
    this.modalCloseButtons = document.querySelectorAll(".modal-close");

    flatpickr(this.tripDatesInput, {
      mode: "range",
      dateFormat: "Y-m-d",
      minDate: "today",
      static: false,
      theme: "material_blue",
    });

    flatpickr(this.dayDateInput, {
      dateFormat: "Y-m-d",
      minDate: "today",
      static: false,
      theme: "material_blue",
    });
  }

  setupEventListeners() {
    this.addTripBtn.addEventListener("click", () => this.openAddTripModal());
    this.addTripSidebarBtn.addEventListener("click", () => {
      this.openAddTripModal();
      if (window.innerWidth <= 768) {
        this.toggleSidebar();
      }
    });
    this.saveTripBtn.addEventListener("click", () => this.saveTrip());
    this.cancelTripBtn.addEventListener("click", () =>
      this.closeModal(this.addTripModal)
    );
    this.saveItineraryBtn.addEventListener("click", () =>
      this.saveToLocalStorage()
    );
    this.viewBudgetBtn.addEventListener("click", () => this.showBudgetPage());
    this.exportItineraryBtn.addEventListener("click", () =>
      this.exportItineraryPDF()
    );
    this.completeTripBtn.addEventListener("click", () => this.completeTrip());
    this.backToLandingBtn.addEventListener("click", () =>
      this.showLandingPage()
    );
    this.backToItineraryBtn.addEventListener("click", () =>
      this.showItineraryPage(this.currentTripId)
    );
    this.exportSummaryBtn.addEventListener("click", () =>
      this.exportSummaryPDF()
    );
    this.saveDayBtn.addEventListener("click", () => this.saveDay());
    this.cancelDayBtn.addEventListener("click", () => this.closeDayModal());
    this.saveActivityBtn.addEventListener("click", () => this.saveActivity());
    this.cancelActivityBtn.addEventListener("click", () =>
      this.closeActivityModal()
    );

    this.showPieChartBtn.addEventListener("click", () =>
      this.renderChart("pie")
    );
    this.showBarChartBtn.addEventListener("click", () =>
      this.renderChart("bar")
    );
    this.showLineChartBtn.addEventListener("click", () =>
      this.renderChart("line")
    );

    this.hamburgerBtn.addEventListener("click", () => this.toggleSidebar());
    document.addEventListener("click", (e) => {
      if (
        !this.sidebar.contains(e.target) &&
        !this.hamburgerBtn.contains(e.target) &&
        this.sidebar.classList.contains("active") &&
        window.innerWidth <= 768
      ) {
        this.toggleSidebar();
      }
    });

    this.modalCloseButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal-backdrop");
        this.closeModal(modal);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const openModals = document.querySelectorAll(".modal-backdrop.active");
        openModals.forEach((modal) => this.closeModal(modal));
        if (
          this.sidebar.classList.contains("active") &&
          window.innerWidth <= 768
        ) {
          this.toggleSidebar();
        }
      }
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.saveToLocalStorage();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        this.sidebar.classList.remove("hidden");
        this.mainContent.classList.remove("full-width");
        this.sidebar.classList.remove("active");
      } else {
        this.sidebar.classList.add("hidden");
        this.mainContent.classList.add("full-width");
      }
    });
  }

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.sidebar.classList.toggle("active");
      this.sidebar.classList.toggle("hidden");
      this.mainContent.classList.toggle("full-width");
      anime({
        targets: this.sidebar,
        translateX: this.sidebar.classList.contains("active")
          ? [-250, 0]
          : [0, -250],
        duration: 300,
        easing: "easeOutQuad",
      });
    }
  }

  requestNotificationPermission() {
    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        }
      });
    }
  }

  showBrowserNotification(title, body) {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "https://static-00.iconduck.com/assets.00/notification-icon-462x512-tqwyit2p.png",
      });
    }
  }

  scheduleReminder(activity, tripDate) {
    if (!activity.time || !activity.reminder) return;
    const [hours, minutes] = activity.time.split(":");
    const activityDate = new Date(tripDate);
    activityDate.setHours(parseInt(hours), parseInt(minutes) - 15);
    const now = new Date();
    const timeDiff = activityDate.getTime() - now.getTime();

    if (timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000) {
      const timeoutId = setTimeout(() => {
        this.showBrowserNotification(
          `Reminder: ${activity.title}`,
          `${activity.title} in 15 minutes!`
        );
      }, timeDiff);
      this.notificationTimeouts.push({
        activityId: activity.id,
        timeoutId,
      });
    }
  }

  clearReminders() {
    this.notificationTimeouts.forEach(({ timeoutId }) =>
      clearTimeout(timeoutId)
    );
    this.notificationTimeouts = [];
  }

  scheduleAllReminders() {
    this.clearReminders();
    this.trips.forEach((trip) => {
      if (!trip.completed) {
        trip.days.forEach((day, index) => {
          const tripDate = new Date(trip.dates[0]);
          tripDate.setDate(tripDate.getDate() + index);
          day.activities.forEach((activity) => {
            if (activity.reminder && activity.time) {
              this.scheduleReminder(activity, tripDate);
            }
          });
        });
      }
    });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  loadFromLocalStorage() {
    const savedTrips = localStorage.getItem("trips");
    if (savedTrips) {
      try {
        this.trips = JSON.parse(savedTrips);
      } catch (e) {
        console.error("Error parsing saved trips:", e);
        this.trips = mockData;
      }
    } else {
      this.trips = mockData;
    }
  }

  saveToLocalStorage() {
    localStorage.setItem("trips", JSON.stringify(this.trips));
    this.showSaveNotification();
    this.showBrowserNotification(
      "Itinerary Saved",
      "Your itinerary has been saved successfully!"
    );
    this.scheduleAllReminders();
  }

  showSaveNotification() {
    this.saveNotification.classList.add("active");
    setTimeout(() => {
      this.saveNotification.classList.remove("active");
    }, 3000);
  }

  initializeMap(activity, containerId) {
    const map = L.map(containerId).setView([30.7353, 79.0669], 8); // Default to Uttarakhand
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (activity.latitude && activity.longitude) {
      L.marker([activity.latitude, activity.longitude])
        .addTo(map)
        .bindPopup(activity.title)
        .openPopup();
      map.setView([activity.latitude, activity.longitude], 15);
    }

    return map;
  }

  renderSidebar() {
    const ongoingTrips = this.trips.filter((trip) => !trip.completed);
    const completedTrips = this.trips.filter((trip) => trip.completed);

    this.ongoingTripList.innerHTML = "";
    ongoingTrips.forEach((trip) => {
      const li = document.createElement("li");
      li.className = `trip-item ${
        trip.id === this.currentTripId ? "active" : ""
      }`;
      li.dataset.tripId = trip.id;
      li.textContent = trip.title;
      li.addEventListener("click", () => {
        this.showItineraryPage(trip.id);
        if (window.innerWidth <= 768) {
          this.toggleSidebar();
        }
      });
      this.ongoingTripList.appendChild(li);
    });

    this.completedTripList.innerHTML = "";
    completedTrips.forEach((trip) => {
      const li = document.createElement("li");
      li.className = "trip-item";
      li.dataset.tripId = trip.id;
      li.textContent = trip.title;
      li.addEventListener("click", () => {
        this.showSummaryPage(trip.id);
        if (window.innerWidth <= 768) {
          this.toggleSidebar();
        }
      });
      this.completedTripList.appendChild(li);
    });

    this.animateSidebar();
  }

  renderLandingPage() {
    this.showPage(this.landingPage);
    this.historyList.innerHTML = "";
    this.ongoingList.innerHTML = "";
    const completedTrips = this.trips.filter((trip) => trip.completed);
    const ongoingTrips = this.trips.filter((trip) => !trip.completed);
    if (completedTrips.length === 0) {
      this.historyList.innerHTML = "<p>No completed trips yet.</p>";
    } else {
      completedTrips.forEach((trip) => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.innerHTML = `
            <h3>${trip.title}</h3>
            <p>Dates: ${trip.dates.join(" to ")}</p>
            <p>Days: ${trip.days.length}</p>
          `;
        item.addEventListener("click", () => this.showSummaryPage(trip.id));
        this.historyList.appendChild(item);
      });
    }
    if (ongoingTrips.length === 0) {
      this.ongoingList.innerHTML = "<p>No completed trips yet.</p>";
    } else {
      ongoingTrips.forEach((trip) => {
        const item = document.createElement("div");
        item.className = "ongoing-item";
        item.innerHTML = `
            <h3>${trip.title}</h3>
            <p>Dates: ${trip.dates.join(" to ")}</p>
            <p>Days: ${trip.days.length}</p>
          `;
        item.addEventListener("click", () => this.renderItineraryPage(trip.id));
        this.ongoingList.appendChild(item);
      });
    }
    this.animateLandingPage();
  }

  renderItineraryPage(tripId) {
    this.currentTripId = tripId;
    const trip = this.trips.find((t) => t.id === tripId);
    this.tripTitleElement.textContent = trip.title;
    this.showPage(this.itineraryPage);
    this.renderBoard(trip);
    this.renderSidebar();
  }

  renderBoard(trip) {
    this.boardElement.innerHTML = "";
    this.sortables.forEach((sortable) => sortable.destroy());
    this.sortables = [];

    if (trip.days.length === 0) {
      this.boardElement.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-map-signs"></i>
            <h3>No days added</h3>
            <p>Add a day to start planning.</p>
            <button class="btn add-first-day"><i class="fas fa-plus"></i> Add Day</button>
          </div>
        `;
      this.boardElement
        .querySelector(".add-first-day")
        .addEventListener("click", () => this.openAddDayModal());
    } else {
      trip.days.forEach((day) => {
        const dayColumn = this.createDayColumn(day);
        this.boardElement.appendChild(dayColumn);
      });
    }

    const addDayButton = this.createAddDayButton();
    this.boardElement.appendChild(addDayButton);
    this.initSortables();
    this.animateBoard();
  }

  createDayColumn(day) {
    const dayColumn = document.createElement("div");
    dayColumn.className = "day-column";
    dayColumn.dataset.dayId = day.id;

    const dayHeader = document.createElement("div");
    dayHeader.className = "day-header";
    dayHeader.innerHTML = `
        <div class="day-title">${day.title}</div>
        <div class="day-actions">
          <button class="action-btn edit-day" title="Edit Day"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete-day" title="Delete Day"><i class="fas fa-trash"></i></button>
        </div>
      `;

    const activitiesContainer = document.createElement("div");
    activitiesContainer.className = "activities";
    activitiesContainer.dataset.dayId = day.id;

    day.activities.forEach((activity) => {
      const activityCard = this.createActivityCard(activity, day);
      activitiesContainer.appendChild(activityCard);
    });

    const dayFooter = document.createElement("div");
    dayFooter.className = "day-footer";
    dayFooter.innerHTML = `
        <button class="add-activity"><i class="fas fa-plus"></i> Add Activity</button>
      `;

    dayColumn.appendChild(dayHeader);
    dayColumn.appendChild(activitiesContainer);
    dayColumn.appendChild(dayFooter);

    dayHeader
      .querySelector(".edit-day")
      .addEventListener("click", () => this.openEditDayModal(day));
    dayHeader
      .querySelector(".delete-day")
      .addEventListener("click", () => this.deleteDay(day.id));
    dayFooter
      .querySelector(".add-activity")
      .addEventListener("click", () => this.openAddActivityModal(day.id));

    return dayColumn;
  }

  createActivityCard(activity, day) {
    const activityCard = document.createElement("div");
    activityCard.className = `activity-card ${
      activity.completed
        ? "completed-activity"
        : activity.notCompleted
        ? "not-completed-activity"
        : ""
    }`;
    activityCard.dataset.activityId = activity.id;

    let timeDisplay = activity.time ? this.formatTime(activity.time) : "";
    let costDisplay = activity.cost ? `₹${activity.cost.toFixed(2)}` : "";
    const mapId = `map-${activity.id}`;

    activityCard.innerHTML = `
        ${timeDisplay ? `<div class="activity-time">${timeDisplay}</div>` : ""}
        ${costDisplay ? `<div class="activity-cost">${costDisplay}</div>` : ""}
        <div class="activity-title"><i class="fas fa-grip-lines drag-handle"></i> ${
          activity.title
        }</div>
        ${
          activity.description
            ? `<div class="activity-description">${activity.description}</div>`
            : ""
        }
        <div class="activity-details">
          ${
            activity.notes
              ? `<p><strong>Notes:</strong> ${activity.notes}</p>`
              : ""
          }
          ${
            activity.location
              ? `<p><strong>Location:</strong> ${activity.location}</p>`
              : ""
          }
          ${day.date ? `<p><strong>Date:</strong> ${day.date}</p>` : ""}
          ${
            this.trips.find((t) => t.id === this.currentTripId).destination
              ? `<p><strong>Destination:</strong> ${
                  this.trips.find((t) => t.id === this.currentTripId)
                    .destination
                }</p>`
              : ""
          }
          ${
            activity.category
              ? `<p><strong>Category:</strong> ${activity.category}</p>`
              : ""
          }
          ${
            activity.latitude && activity.longitude
              ? `<div id="${mapId}" class="map-container"></div>`
              : ""
          }
        </div>
        <div class="activity-actions">
          <button class="activity-action details" title="Show Details">
            <i class="fas fa-info-circle"></i> Details
          </button>
          ${
            !activity.completed && !activity.notCompleted
              ? `
                <button class="activity-action completed" title="Mark as Completed">
                  <i class="fas fa-check"></i> Completed
                </button>
                <button class="activity-action not-completed" title="Mark as Not Completed">
                  <i class="fas fa-times"></i> Not Completed
                </button>
                <button class="activity-action edit" title="Edit Activity"><i class="fas fa-edit"></i></button>
                <button class="activity-action delete" title="Delete Activity"><i class="fas fa-trash"></i></button>
              `
              : ""
          }
        </div>
      `;

    const detailsButton = activityCard.querySelector(".details");
    const detailsSection = activityCard.querySelector(".activity-details");

    detailsButton.addEventListener("click", () => {
      const isActive = detailsSection.classList.contains("active");
      detailsSection.classList.toggle("active");

      if (!isActive) {
        detailsButton.innerHTML =
          '<i class="fas fa-info-circle"></i> Hide Details';
        if (activity.latitude && activity.longitude) {
          setTimeout(() => {
            this.initializeMap(activity, mapId);
          }, 0);
        }
        anime({
          targets: detailsSection,
          height: ["0px", "auto"],
          opacity: [0, 1],
          duration: 300,
          easing: "easeOutQuad",
        });
      } else {
        detailsButton.innerHTML = '<i class="fas fa-info-circle"></i> Details';
        anime({
          targets: detailsSection,
          height: ["auto", "0px"],
          opacity: [1, 0],
          duration: 300,
          easing: "easeOutQuad",
          complete: () => {
            detailsSection.style.height = "";
          },
        });
      }
    });

    if (!activity.completed && !activity.notCompleted) {
      activityCard
        .querySelector(".completed")
        ?.addEventListener("click", () =>
          this.markActivityStatus(activity.id, true, false)
        );
      activityCard
        .querySelector(".not-completed")
        ?.addEventListener("click", () =>
          this.markActivityStatus(activity.id, false, true)
        );
      activityCard
        .querySelector(".edit")
        ?.addEventListener("click", () =>
          this.openEditActivityModal(activity.id)
        );
      activityCard
        .querySelector(".delete")
        ?.addEventListener("click", () => this.deleteActivity(activity.id));
    }

    return activityCard;
  }

  createAddDayButton() {
    const addDayButton = document.createElement("div");
    addDayButton.className = "add-day";
    addDayButton.innerHTML = `
        <i class="fas fa-plus-circle"></i>
        <div class="add-day-text">Add Day</div>
      `;
    addDayButton.addEventListener("click", () => this.openAddDayModal());
    return addDayButton;
  }

  initSortables() {
    const activitiesContainers = document.querySelectorAll(".activities");
    activitiesContainers.forEach((container) => {
      const sortable = new Sortable(container, {
        group: "activities",
        animation: 150,
        delay: 50,
        delayOnTouchOnly: true,
        touchStartThreshold: 5,
        handle: ".drag-handle",
        ghostClass: "dropzone",
        chosenClass: "dragging",
        onEnd: (evt) => this.handleActivityDrop(evt),
      });
      this.sortables.push(sortable);
    });
  }

  handleActivityDrop(evt) {
    const activityId = evt.item.dataset.activityId;
    const sourceDayId = evt.from.dataset.dayId;
    const targetDayId = evt.to.dataset.dayId;
    const newIndex = evt.newIndex;

    const trip = this.trips.find((t) => t.id === this.currentTripId);
    const sourceDay = trip.days.find((day) => day.id === sourceDayId);
    const activityIndex = sourceDay.activities.findIndex(
      (activity) => activity.id === activityId
    );
    const activity = sourceDay.activities[activityIndex];

    if (sourceDayId === targetDayId) {
      sourceDay.activities.splice(activityIndex, 1);
      sourceDay.activities.splice(newIndex, 0, activity);
    } else {
      sourceDay.activities.splice(activityIndex, 1);
      const targetDay = trip.days.find((day) => day.id === targetDayId);
      targetDay.activities.splice(newIndex, 0, activity);
    }

    this.saveToLocalStorage();
    anime({
      targets: evt.item,
      backgroundColor: ["rgba(74, 111, 165, 0.2)", "rgba(74, 111, 165, 0)"],
      duration: 1000,
      easing: "easeOutQuad",
    });
  }

  exportItineraryPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const trip = this.trips.find((t) => t.id === this.currentTripId);
    let yOffset = 20;

    doc.setFontSize(18);
    doc.text(trip.title, 20, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Dates: ${trip.dates.join(" to ")}`, 20, yOffset);
    yOffset += 7;
    doc.text(`Destination: ${trip.destination}`, 20, yOffset);
    yOffset += 10;

    trip.days.forEach((day, index) => {
      yOffset += 10;
      doc.setFontSize(14);
      doc.text(`${day.title} (${day.date})`, 20, yOffset);
      yOffset += 10;
      doc.setFontSize(12);
      day.activities.forEach((activity) => {
        const status = activity.completed
          ? "Completed"
          : activity.notCompleted
          ? "Not Completed"
          : "Pending";
        const cost = activity.cost ? `₹${activity.cost.toFixed(2)}` : "₹0.00";
        const text = `- ${activity.title} (${
          activity.time || "No time"
        }) - ${status} - ${cost}`;
        if (yOffset > 270) {
          doc.addPage();
          yOffset = 20;
        }
        doc.text(text, 30, yOffset);
        if (activity.description) {
          yOffset += 7;
          doc.text(`  Description: ${activity.description}`, 30, yOffset, {
            maxWidth: 150,
          });
        }
        if (activity.location) {
          yOffset += 7;
          doc.text(`  Location: ${activity.location}`, 30, yOffset);
        }
        if (activity.category) {
          yOffset += 7;
          doc.text(`  Category: ${activity.category}`, 30, yOffset);
        }
        if (activity.notes) {
          yOffset += 7;
          doc.text(`  Notes: ${activity.notes}`, 30, yOffset, {
            maxWidth: 150,
          });
        }
        yOffset += 10;
      });
    });

    const budgetInfo = this.calculateBudget(trip);
    yOffset += 10;
    doc.setFontSize(14);
    doc.text("Budget Summary", 20, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Total Budget: ₹${budgetInfo.total.toFixed(2)}`, 20, yOffset);
    yOffset += 7;
    doc.text(`Total Spent: ₹${budgetInfo.spent.toFixed(2)}`, 20, yOffset);

    doc.save(`${trip.title}_Itinerary.pdf`);
  }

  exportSummaryPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const trip = this.trips.find((t) => t.id === this.currentTripId);
    let yOffset = 20;

    doc.setFontSize(18);
    doc.text(`Summary: ${trip.title}`, 20, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Dates: ${trip.dates.join(" to ")}`, 20, yOffset);
    yOffset += 7;
    doc.text(`Destination: ${trip.destination}`, 20, yOffset);
    yOffset += 7;
    doc.text(`Total Days: ${trip.days.length}`, 20, yOffset);
    yOffset += 10;

    let totalActivities = 0;
    let completedActivities = 0;
    let notCompletedActivities = 0;

    trip.days.forEach((day) => {
      yOffset += 10;
      doc.setFontSize(14);
      doc.text(`${day.title} (${day.date})`, 20, yOffset);
      yOffset += 10;
      doc.setFontSize(12);
      day.activities.forEach((activity) => {
        totalActivities++;
        if (activity.completed) completedActivities++;
        if (activity.notCompleted) notCompletedActivities++;
        const status = activity.completed
          ? "Completed"
          : activity.notCompleted
          ? "Not Completed"
          : "Pending";
        const cost = activity.cost ? `₹${activity.cost.toFixed(2)}` : "₹0.00";
        const text = `- ${activity.title} - ${status} - ${cost}`;
        if (yOffset > 270) {
          doc.addPage();
          yOffset = 20;
        }
        doc.text(text, 30, yOffset);
        yOffset += 7;
      });
    });

    yOffset += 10;
    doc.setFontSize(14);
    doc.text("Activity Summary", 20, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Total Activities: ${totalActivities}`, 20, yOffset);
    yOffset += 7;
    doc.text(`Completed: ${completedActivities}`, 20, yOffset);
    yOffset += 7;
    doc.text(`Not Completed: ${notCompletedActivities}`, 20, yOffset);
    yOffset += 7;
    doc.text(
      `Pending: ${
        totalActivities - completedActivities - notCompletedActivities
      }`,
      20,
      yOffset
    );

    const budgetInfo = this.calculateBudget(trip);
    yOffset += 10;
    doc.setFontSize(14);
    doc.text("Budget Summary", 20, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Total Budget: ₹${budgetInfo.total.toFixed(2)}`, 20, yOffset);
    yOffset += 7;
    doc.text(`Total Spent: ₹${budgetInfo.spent.toFixed(2)}`, 20, yOffset);

    doc.save(`${trip.title}_Summary.pdf`);
  }

  calculateBudget(trip) {
    let total = 0;
    let spent = 0;
    trip.days.forEach((day) => {
      day.activities.forEach((activity) => {
        if (activity.cost) {
          total += activity.cost;
          if (activity.completed) spent += activity.cost;
        }
      });
    });
    return { total, spent };
  }

  openAddTripModal() {
    this.tripForm.reset();
    this.addTripModal.querySelector(".modal-title").textContent = "Add Trip";
    this.openModal(this.addTripModal);
  }

  openAddDayModal() {
    this.dayForm.reset();
    this.editDayIdInput.value = "";
    this.addDayModal.querySelector(".modal-title").textContent = "Add Day";
    this.openModal(this.addDayModal);
  }

  openEditDayModal(day) {
    this.currentDayId = day.id;
    this.dayTitleInput.value = day.title;
    this.dayDateInput.value = day.date;
    this.editDayIdInput.value = day.id;
    this.addDayModal.querySelector(".modal-title").textContent = "Edit Day";
    this.openModal(this.addDayModal);
  }

  openAddActivityModal(dayId) {
    this.currentDayId = dayId;
    this.currentActivityId = null;
    this.activityForm.reset();
    this.dayIdInput.value = dayId;
    this.activityIdInput.value = "";
    this.addActivityModal.querySelector(".modal-title").textContent =
      "Add Activity";
    this.openModal(this.addActivityModal);
  }

  openEditActivityModal(activityId) {
    const trip = this.trips.find((t) => t.id === this.currentTripId);
    let dayId, activity;
    trip.days.forEach((day) => {
      const found = day.activities.find((act) => act.id === activityId);
      if (found) {
        dayId = day.id;
        activity = found;
      }
    });
    this.currentDayId = dayId;
    this.currentActivityId = activityId;
    this.activityTimeInput.value = activity.time || "";
    this.activityTitleInput.value = activity.title;
    this.activityCostInput.value = activity.cost || "";
    this.activityDescriptionInput.value = activity.description || "";
    this.activityLocationInput.value = activity.location || "";
    this.activityCategoryInput.value = activity.category || "";
    this.activityNotesInput.value = activity.notes || "";
    this.activityLatitudeInput.value = activity.latitude || "";
    this.activityLongitudeInput.value = activity.longitude || "";
    this.activityReminderInput.checked = activity.reminder || false;
    this.dayIdInput.value = dayId;
    this.activityIdInput.value = activityId;
    this.addActivityModal.querySelector(".modal-title").textContent =
      "Edit Activity";
    this.openModal(this.addActivityModal);
  }

  openModal(modal) {
    modal.classList.add("active");
    anime({
      targets: modal.querySelector(".modal"),
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 300,
      easing: "easeOutQuad",
    });
  }

  closeModal(modal) {
    anime({
      targets: modal.querySelector(".modal"),
      translateY: [0, -20],
      opacity: [1, 0],
      duration: 300,
      easing: "easeInQuad",
      complete: () => {
        modal.classList.remove("active");
      },
    });
  }

  closeDayModal() {
    this.closeModal(this.addDayModal);
  }

  closeActivityModal() {
    this.closeModal(this.addActivityModal);
  }

  saveTrip() {
    const title = this.tripTitleInput.value.trim();
    const destination = this.tripDestinationInput.value.trim();
    const dates = this.tripDatesInput.value.split(" to ");
    if (!title || !destination || dates.length < 2) {
      this.tripTitleInput.classList.add("is-invalid");
      this.tripDestinationInput.classList.add("is-invalid");
      this.tripDatesInput.classList.add("is-invalid");
      return;
    }

    const newTrip = {
      id: this.generateId(),
      title,
      destination,
      dates,
      days: [],
      completed: false,
    };

    this.trips.push(newTrip);
    this.currentTripId = newTrip.id;
    this.saveToLocalStorage();
    this.closeModal(this.addTripModal);
    this.showItineraryPage(newTrip.id);
  }

  saveDay() {
    const dayTitle = this.dayTitleInput.value.trim();
    const dayDate = this.dayDateInput.value;
    const editDayId = this.editDayIdInput.value;

    if (!dayTitle || !dayDate) {
      this.dayTitleInput.classList.add("is-invalid");
      this.dayDateInput.classList.add("is-invalid");
      return;
    }

    const trip = this.trips.find((t) => t.id === this.currentTripId);
    if (editDayId) {
      const dayIndex = trip.days.findIndex((day) => day.id === editDayId);
      trip.days[dayIndex].title = dayTitle;
      trip.days[dayIndex].date = dayDate;
    } else {
      trip.days.push({
        id: this.generateId(),
        title: dayTitle,
        date: dayDate,
        activities: [],
      });
    }

    this.saveToLocalStorage();
    this.renderItineraryPage(this.currentTripId);
    this.closeDayModal();
  }

  saveActivity() {
    const dayId = this.dayIdInput.value;
    const activityId = this.activityIdInput.value;
    const time = this.activityTimeInput.value;
    const title = this.activityTitleInput.value.trim();
    const cost = parseFloat(this.activityCostInput.value) || 0;
    const description = this.activityDescriptionInput.value.trim();
    const location = this.activityLocationInput.value.trim();
    const category = this.activityCategoryInput.value;
    const notes = this.activityNotesInput.value.trim();
    const latitude = parseFloat(this.activityLatitudeInput.value) || null;
    const longitude = parseFloat(this.activityLongitudeInput.value) || null;
    const reminder = this.activityReminderInput.checked;

    if (!title) {
      this.activityTitleInput.classList.add("is-invalid");
      return;
    }

    const trip = this.trips.find((t) => t.id === this.currentTripId);
    const dayIndex = trip.days.findIndex((day) => day.id === dayId);

    const activityData = {
      id: activityId || this.generateId(),
      time,
      title,
      cost,
      description,
      location,
      category,
      notes,
      latitude,
      longitude,
      reminder,
      completed: false,
      notCompleted: false,
    };

    if (activityId) {
      const activityIndex = trip.days[dayIndex].activities.findIndex(
        (activity) => activity.id === activityId
      );
      activityData.completed =
        trip.days[dayIndex].activities[activityIndex].completed;
      activityData.notCompleted =
        trip.days[dayIndex].activities[activityIndex].notCompleted;
      trip.days[dayIndex].activities[activityIndex] = activityData;
    } else {
      trip.days[dayIndex].activities.push(activityData);
    }

    this.saveToLocalStorage();
    this.renderItineraryPage(this.currentTripId);
    this.closeActivityModal();
  }

  deleteDay(dayId) {
    if (confirm("Are you sure you want to delete this day?")) {
      const trip = this.trips.find((t) => t.id === this.currentTripId);
      trip.days = trip.days.filter((day) => day.id !== dayId);
      this.saveToLocalStorage();
      this.renderItineraryPage(this.currentTripId);
    }
  }

  deleteActivity(activityId) {
    if (confirm("Are you sure you want to delete this activity?")) {
      const trip = this.trips.find((t) => t.id === this.currentTripId);
      trip.days.forEach((day) => {
        day.activities = day.activities.filter(
          (activity) => activity.id !== activityId
        );
      });
      this.saveToLocalStorage();
      this.renderItineraryPage(this.currentTripId);
    }
  }

  markActivityStatus(activityId, completed, notCompleted) {
    const trip = this.trips.find((t) => t.id === this.currentTripId);
    trip.days.forEach((day) => {
      const activity = day.activities.find((act) => act.id === activityId);
      if (activity) {
        activity.completed = completed;
        activity.notCompleted = notCompleted;
      }
    });
    this.saveToLocalStorage();
    this.renderItineraryPage(this.currentTripId);
  }

  completeTrip() {
    if (confirm("Are you sure you want to mark this trip as completed?")) {
      const trip = this.trips.find((t) => t.id === this.currentTripId);
      trip.completed = true;
      this.saveToLocalStorage();
      this.showSummaryPage(this.currentTripId);
    }
  }

  showPage(page) {
    [
      this.landingPage,
      this.itineraryPage,
      this.summaryPage,
      this.budgetPage,
    ].forEach((p) => p.classList.remove("active"));
    page.classList.add("active");
  }

  showItineraryPage(tripId) {
    this.currentTripId = tripId;
    this.renderItineraryPage(tripId);
  }

  showSummaryPage(tripId) {
    this.currentTripId = tripId;
    const trip = this.trips.find((t) => t.id === tripId);
    this.showPage(this.summaryPage);
    this.summaryTitle.textContent = trip.title;

    let totalActivities = 0;
    let completedActivities = 0;
    let notCompletedActivities = 0;
    trip.days.forEach((day) => {
      totalActivities += day.activities.length;
      completedActivities += day.activities.filter((a) => a.completed).length;
      notCompletedActivities += day.activities.filter(
        (a) => a.notCompleted
      ).length;
    });

    const budgetInfo = this.calculateBudget(trip);
    this.summaryStats.innerHTML = `
        <p>Total Days: ${trip.days.length}</p>
        <p>Total Activities: ${totalActivities}</p>
        <p>Completed: ${completedActivities}</p>
        <p>Not Completed: ${notCompletedActivities}</p>
        <p>Pending: ${
          totalActivities - completedActivities - notCompletedActivities
        }</p>
        <p>Total Budget: ₹${budgetInfo.total.toFixed(2)}</p>
        <p>Total Spent: ₹${budgetInfo.spent.toFixed(2)}</p>
      `;

    this.activityList.innerHTML = "<h3>Activities</h3>";
    const ul = document.createElement("ul");
    trip.days.forEach((day) => {
      day.activities.forEach((activity) => {
        const status = activity.completed
          ? "Completed"
          : activity.notCompleted
          ? "Not Completed"
          : "Pending";
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${activity.title} (${day.title})</span>
            <span>${status} - ₹${
          activity.cost ? activity.cost.toFixed(2) : "0.00"
        }</span>
          `;
        ul.appendChild(li);
      });
    });
    this.activityList.appendChild(ul);

    this.budgetSummary.innerHTML = "<h3>Budget Summary</h3>";
    const budgetUl = document.createElement("ul");
    budgetUl.innerHTML = `
        <li><span>Total Budget:</span><span>₹${budgetInfo.total.toFixed(
          2
        )}</span></li>
        <li><span>Total Spent:</span><span>₹${budgetInfo.spent.toFixed(
          2
        )}</span></li>
        <li><span>Remaining:</span><span>₹${(
          budgetInfo.total - budgetInfo.spent
        ).toFixed(2)}</span></li>
      `;
    this.budgetSummary.appendChild(budgetUl);

    this.renderChart(this.currentChartType);
    this.renderSidebar();
  }

  showBudgetPage() {
    const trip = this.trips.find((t) => t.id === this.currentTripId);
    this.showPage(this.budgetPage);
    this.budgetTitle.textContent = trip.title;

    const budgetInfo = this.calculateBudget(trip);
    this.budgetStats.innerHTML = `
        <p>Total Budget: ₹${budgetInfo.total.toFixed(2)}</p>
        <p>Total Spent: ₹${budgetInfo.spent.toFixed(2)}</p>
        <p>Remaining: ₹${(budgetInfo.total - budgetInfo.spent).toFixed(2)}</p>
      `;

    this.budgetList.innerHTML = "<h3>Expenses</h3>";
    const ul = document.createElement("ul");
    trip.days.forEach((day) => {
      day.activities.forEach((activity) => {
        if (activity.cost) {
          const li = document.createElement("li");
          li.innerHTML = `
              <span>${activity.title} (${day.title})</span>
              <span>₹${activity.cost.toFixed(2)}</span>
            `;
          ul.appendChild(li);
        }
      });
    });
    this.budgetList.appendChild(ul);
  }

  renderChart(type) {
    if (this.chart) {
      this.chart.destroy();
    }
    this.currentChartType = type;
    const trip = this.trips.find((t) => t.id === this.currentTripId);
    let totalActivities = 0;
    let completedActivities = 0;
    let notCompletedActivities = 0;
    trip.days.forEach((day) => {
      totalActivities += day.activities.length;
      completedActivities += day.activities.filter((a) => a.completed).length;
      notCompletedActivities += day.activities.filter(
        (a) => a.notCompleted
      ).length;
    });
    const pendingActivities =
      totalActivities - completedActivities - notCompletedActivities;

    const data = {
      labels: ["Completed", "Not Completed", "Pending"],
      datasets: [
        {
          data: [
            completedActivities,
            notCompletedActivities,
            pendingActivities,
          ],
          backgroundColor: ["#2ecc71", "#e74c3c", "#aaa"],
          borderColor: ["#27ae60", "#c0392b", "#888"],
          borderWidth: 1,
        },
      ],
    };

    const config = {
      type: type,
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: document.body.classList.contains("dark-theme")
                ? "#f5f5f5"
                : "#333",
            },
          },
          title: {
            display: true,
            text: "Activity Completion Status",
            color: document.body.classList.contains("dark-theme")
              ? "#f5f5f5"
              : "#333",
          },
        },
        scales:
          type !== "pie"
            ? {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: document.body.classList.contains("dark-theme")
                      ? "#f5f5f5"
                      : "#333",
                  },
                  grid: {
                    color: document.body.classList.contains("dark-theme")
                      ? "#444"
                      : "#ddd",
                  },
                },
                x: {
                  ticks: {
                    color: document.body.classList.contains("dark-theme")
                      ? "#f5f5f5"
                      : "#333",
                  },
                  grid: {
                    color: document.body.classList.contains("dark-theme")
                      ? "#444"
                      : "#ddd",
                  },
                },
              }
            : {},
      },
    };

    this.chart = new Chart(this.completionChart, config);
  }

  animateSidebar() {
    anime({
      targets: ".trip-item",
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      easing: "easeOutQuad",
    });
  }

  animateLandingPage() {
    anime({
      targets: ".history-item",
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      easing: "easeOutQuad",
    });
  }

  animateBoard() {
    anime({
      targets: ".day-column, .add-day",
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      easing: "easeOutQuad",
    });
  }

  formatTime(time) {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  }
}

const itineraryBoard = new ItineraryBoard();
