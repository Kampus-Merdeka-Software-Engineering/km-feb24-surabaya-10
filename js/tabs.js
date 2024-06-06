function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Klik tab default setelah loading selesai
document.getElementById("defaultOpen").click();

//fungsi untuk kembali ke halaman landing page
function exitToLandingPage() {
    const landingPage = document.getElementById('landingPage');
    const header = document.getElementById('header');
    const main = document.getElementById('main');
    const footer = document.getElementById('footer');

    // Tampilkan halaman landing dan sembunyikan konten utama
    landingPage.style.display = 'block';
    header.style.display = 'none';
    main.style.display = 'none';

}
