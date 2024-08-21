document.addEventListener('DOMContentLoaded', () => {
            const favoriteButtons = document.querySelectorAll('.favorite-button');
            favoriteButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const heartIcon = button.querySelector('i');
                    heartIcon.classList.toggle('bi-heart');
                    heartIcon.classList.toggle('bi-heart-fill');
                });
            });
        });