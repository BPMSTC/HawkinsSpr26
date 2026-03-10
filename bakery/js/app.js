/* global $ */

$(function () {

  // ================= SMOOTH SCROLL =================
  $(".nav-link[href^='#'], .btn[href^='#']").on("click", function (e) {
    e.preventDefault();

    const target = $(this.hash);

    if (target.length) {
      $("html, body").animate({
        scrollTop: target.offset().top - 70
      }, 600);
    }
  });

  // ================= FADE IN ON SCROLL =================
  function reveal() {
    $(".fade-in").each(function () {
      const elementTop = $(this).offset().top;
      const viewportBottom = $(window).scrollTop() + $(window).height();

      if (viewportBottom > elementTop + 50) {
        $(this).animate({ opacity: 1, top: 0 }, 500);
      }
    });
  }

  $(window).on("scroll", reveal);
  reveal();


  // ================= PRODUCTS PAGE LOGIC =================
  if ($("#productContainer").length) {

    $.getJSON("../Data/products.json")
      .done(function (products) {

        const grouped = {};

        products.forEach(function (p) {
          if (!grouped[p.category]) {
            grouped[p.category] = [];
          }
          grouped[p.category].push(p);
        });

        Object.keys(grouped).forEach(function (category) {

          const section = $(`
            <div class="mb-5">
              <h2>${category}</h2>
              <div class="accent-line"></div>
              <div class="row g-4"></div>
            </div>
          `);

          const row = section.find(".row");

          grouped[category].forEach(function (p) {

            const card = $(`
              <div class="col-md-4 d-flex fade-in">
                <div class="card menu-card p-4 text-center w-100">

                  <img src="../Images/${p.image}"
                       class="img-fluid mb-3 rope-border"
                       style="height:220px; object-fit:cover;"
                       alt="${p.name}">

                  <h4>${p.name}</h4>
                  <p class="flex-grow-1">${p.description}</p>

                  <small class="text-muted d-block mb-2">
                    ${p.attributes}
                  </small>

                  <strong>$${p.price.toFixed(2)}</strong>

                  <button class="btn btn-dark mt-3">
                    Buy Now
                  </button>

                </div>
              </div>
            `);

            row.append(card);
          });

          $("#productContainer").append(section);
        });

        // Re-trigger fade animation after dynamic load
        reveal();

      })
      .fail(function () {
        console.error("Could not load products.json");
      });
  }

});