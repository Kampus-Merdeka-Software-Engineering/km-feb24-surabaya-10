// Variabel global untuk menyimpan pop-up yang saat ini terbuka
let openPopup = null;

// Mendapatkan semua elemen mentor dan anggota tim
const mentors = document.querySelectorAll('.mentor');
const teamMembers = document.querySelectorAll('.team-member');

// Menambahkan event listener ke setiap elemen mentor
mentors.forEach((mentor, index) => {
  mentor.addEventListener('click', () => {
    // Tutup pop-up yang saat ini terbuka (jika ada)
    if (openPopup) {
      openPopup.style.display = 'none';
    }

    // Mendapatkan elemen popup yang sesuai
    const popupId = `mentorPopup-${index + 1}`;
    const popup = document.getElementById(popupId);
    // Menampilkan pop-up
    popup.style.display = 'block';

    // Menyimpan pop-up yang saat ini terbuka
    openPopup = popup;
  });
});

// Menambahkan event listener ke setiap elemen anggota tim
teamMembers.forEach((teamMember, index) => {
  teamMember.addEventListener('click', () => {
    // Tutup pop-up yang saat ini terbuka (jika ada)
    if (openPopup) {
      openPopup.style.display = 'none';
    }

    // Mendapatkan elemen popup yang sesuai
    const popupId = `popup-${index + 1}`;
    const popup = document.getElementById(popupId);
    // Menampilkan pop-up
    popup.style.display = 'block';

    // Menyimpan pop-up yang saat ini terbuka
    openPopup = popup;
  });
});

// Menambahkan event listener ke ikon tutup di setiap pop-up
document.querySelectorAll('.close-icon').forEach((closeIcon) => {
  closeIcon.addEventListener('click', () => {
    // Mendapatkan elemen pop-up induk
    const popup = closeIcon.parentNode.parentNode;
    // Menyembunyikan pop-up
    popup.style.display = 'none';

    // Reset variabel global
    openPopup = null;
  });
});
