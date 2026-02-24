$(function () {

  // Smooth scroll
  $(".nav-link, .btn[href^='#']").on("click", function (e) {
    e.preventDefault();

    const target = $(this.hash);

    $("html, body").animate({
      scrollTop: target.offset().top - 70
    }, 600);
  });


  // Fade-in on scroll
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


  // Order button demo
  $("#orderBtn").click(function () {
    $("<div class='alert alert-light position-fixed top-50 start-50 translate-middle shadow-lg'>Ordering coming soon!</div>")
      .appendTo("body")
      .delay(1500)
      .fadeOut(400, function () { $(this).remove(); });
  });

});
