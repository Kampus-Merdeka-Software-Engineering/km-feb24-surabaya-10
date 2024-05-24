// Variabel global untuk menyimpan pop-up yang saat ini terbuka
let openPopup = null;

// Get all mentor dan team member elements
const mentors = document.querySelectorAll('.mentor');
const teamMembers = document.querySelectorAll('.team-member');

// Add event listener to each mentor element
mentors.forEach((mentor, index) => {
  mentor.addEventListener('click', () => {
    // Tutup pop-up yang saat ini terbuka (jika ada)
    if (openPopup) {
      openPopup.style.display = 'none';
    }

    // Get the corresponding popup element
    const popupId = `mentorPopup-${index + 1}`;
    const popup = document.getElementById(popupId);
    // Show the popup
    popup.style.display = 'block';

    // Simpan pop-up yang saat ini terbuka
    openPopup = popup;
  });
});

// Add event listener to each team member element
teamMembers.forEach((teamMember, index) => {
  teamMember.addEventListener('click', () => {
    // Tutup pop-up yang saat ini terbuka (jika ada)
    if (openPopup) {
      openPopup.style.display = 'none';
    }

    // Get the corresponding popup element
    const popupId = `popup-${index + 1}`;
    const popup = document.getElementById(popupId);
    // Show the popup
    popup.style.display = 'block';

    // Simpan pop-up yang saat ini terbuka
    openPopup = popup;
  });
});

// Add event listener to close icon in each popup
document.querySelectorAll('.close-icon').forEach((closeIcon) => {
  closeIcon.addEventListener('click', () => {
    // Get the parent popup element
    const popup = closeIcon.parentNode.parentNode;
    // Hide the popup
    popup.style.display = 'none';

    // Reset variabel global
    openPopup = null;
  });
});