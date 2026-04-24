document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('[data-nav-links]');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
});

// for the social proof sections to enlarge images 
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".before-after-shot img");
  if (!images.length) return;

  let lightbox = document.querySelector(".image-lightbox");

  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.className = "image-lightbox";
    lightbox.innerHTML = `
      <button class="image-lightbox__close" type="button" aria-label="Close image">×</button>
      <img src="" alt="">
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector("img");
  const closeBtn = lightbox.querySelector(".image-lightbox__close");

  document.addEventListener("click", (e) => {
    const clickedImg = e.target.closest(".before-after-shot img");

    if (!clickedImg) return;

    lightboxImg.src = clickedImg.src;
    lightboxImg.alt = clickedImg.alt || "Expanded image";
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  });

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
});