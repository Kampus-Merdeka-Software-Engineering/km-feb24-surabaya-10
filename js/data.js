document.addEventListener('DOMContentLoaded', function () {
    const headers = document.querySelectorAll('#dataTable th');
    let isResizing = false;
    let startX, startWidth;

    headers.forEach(header => {
        const handle = header.querySelector('.column');
        handle.addEventListener('mousedown', function (e) {
            isResizing = true;
            startX = e.pageX;
            startWidth = header.offsetWidth;
        });

        document.addEventListener('mousemove', function (e) {
            if (isResizing) {
                const newWidth = startWidth + (e.pageX - startX);
                header.style.width = newWidth + 'px';
            }
        });

        document.addEventListener('mouseup', function () {
            isResizing = false;
        });
    });
});