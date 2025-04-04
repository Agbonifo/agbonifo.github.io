(function ($) {
  var $window = $(window),
    $body = $("body"),
    $nav = $("#nav");

  // Breakpoints.
  breakpoints({
    xlarge: ["1281px", "1680px"],
    large: ["981px", "1280px"],
    medium: ["737px", "980px"],
    small: [null, "736px"],
  });

  // Play initial animations on page load.
  $window.on("load", function () {
    window.setTimeout(function () {
      $body.removeClass("is-preload");
    }, 100);
  });

  // Touch mode.
  if (browser.mobile) $body.addClass("is-touch");

  // Scrolly links.
  $("#nav a, .scrolly").scrolly({
    speed: 1000,
    offset: function () {
      return $nav.height();
    },
  });

  // Nav.

  // Title Bar.
  $(
    '<div id="titleBar">' +
      '<a href="#navPanel" class="toggle"></a>' +
      '<span class="title">' +
      $("#logo").html() +
      "</span>" +
      "</div>"
  ).appendTo($body);

  // Panel.
  $('<div id="navPanel">' + "<nav>" + $("#nav").navList() + "</nav>" + "</div>")
    .appendTo($body)
    .panel({
      delay: 500,
      hideOnClick: true,
      hideOnSwipe: true,
      resetScroll: true,
      resetForms: true,
      side: "left",
      target: $body,
      visibleClass: "navPanel-visible",
    });

  // Parallax.
  if (browser.name == "ie" || browser.mobile) {
    $.fn._parallax = function () {
      return $(this);
    };
  } else {
    $.fn._parallax = function () {
      $(this).each(function () {
        var $this = $(this),
          on,
          off;

        on = function () {
          $this.css("background-position", "center 0px");

          $window.on("scroll._parallax", function () {
            var pos =
              parseInt($window.scrollTop()) - parseInt($this.position().top);

            $this.css("background-position", "center " + pos * -0.15 + "px");
          });
        };

        off = function () {
          $this.css("background-position", "");

          $window.off("scroll._parallax");
        };

        breakpoints.on("<=medium", off);
        breakpoints.on(">medium", on);
      });

      return $(this);
    };

    $window.on("load resize", function () {
      $window.trigger("scroll");
    });
  }

  // Spotlights.
  var $spotlights = $(".spotlight");

  $spotlights._parallax().each(function () {
    var $this = $(this),
      on,
      off;

    on = function () {
      var top, bottom, mode;

      // Use main <img>'s src as this spotlight's background.
      $this.css(
        "background-image",
        'url("' + $this.find(".image.main > img").attr("src") + '")'
      );

      // Side-specific scrollex tweaks.
      if ($this.hasClass("top")) {
        mode = "top";
        top = "-20%";
        bottom = 0;
      } else if ($this.hasClass("bottom")) {
        mode = "bottom-only";
        top = 0;
        bottom = "20%";
      } else {
        mode = "middle";
        top = 0;
        bottom = 0;
      }

      // Add scrollex.
      $this.scrollex({
        mode: mode,
        top: top,
        bottom: bottom,
        initialize: function (t) {
          $this.addClass("inactive");
        },
        terminate: function (t) {
          $this.removeClass("inactive");
        },
        enter: function (t) {
          $this.removeClass("inactive");
        },
      });
    };

    off = function () {
      // Clear spotlight's background.
      $this.css("background-image", "");

      // Remove scrollex.
      $this.unscrollex();
    };

    breakpoints.on("<=medium", off);
    breakpoints.on(">medium", on);
  });

  // Wrappers.
  var $wrappers = $(".wrapper");

  $wrappers.each(function () {
    var $this = $(this),
      on,
      off;

    on = function () {
      $this.scrollex({
        top: 250,
        bottom: 0,
        initialize: function (t) {
          $this.addClass("inactive");
        },
        terminate: function (t) {
          $this.removeClass("inactive");
        },
        enter: function (t) {
          $this.removeClass("inactive");
        },
      });
    };

    off = function () {
      $this.unscrollex();
    };

    breakpoints.on("<=medium", off);
    breakpoints.on(">medium", on);
  });

  // Banner.
  var $banner = $("#banner");

  $banner._parallax();

  //  Typed Text Animation
  new Typed("#typed-text", {
    strings: ["Data Analyst", "Machine Learning Engineer",  "&", "Full-Stack Web Developer"],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true,
  });

  // scroll sections active link
  const sections = document.querySelectorAll("article.wrapper");
  const navLinks = document.querySelectorAll("header nav ul li a");

  window.onscroll = () => {
    sections.forEach((sec) => {
      let top = window.scrollY;
      let offset = sec.offsetTop - 150;
      let height = sec.offsetHeight;
      let id = sec.getAttribute("id");

      if (top >= offset && top < offset + height) {
        navLinks.forEach((links) => {
          links.classList.remove("active");
          document
            .querySelector(`header nav a[href*=` + id + `]`)
            .classList.add("active");
        });
      }
    });
  };

  //  Automatic Capitalization
  document.addEventListener("DOMContentLoaded", function () {
    const inputs = document.querySelectorAll(".auto-cap");

    inputs.forEach((input) => {
      input.addEventListener("input", function () {
        let value = input.value;

        value = value.charAt(0).toUpperCase() + value.slice(1);

        input.value = value.replace(
          /(?<=(?:^|[.?!])\s+)[a-z]/g,
          function (match) {
            return match.toUpperCase();
          }
        );
      });
    });
  });

  document.addEventListener("DOMContentLoaded", () => {
    fetch("https://agbonifo-github-io.vercel.app/csrf-token", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched CSRF Token:", data.csrfToken);
        document.getElementById("_csrf").value = data.csrfToken;
      })
      .catch((err) => console.error("Failed to fetch CSRF token:", err));
  });

// Read More/Read Less Functionality
document.addEventListener("DOMContentLoaded", function () {
  const boxes = document.querySelectorAll(".box.style2");

  boxes.forEach(function (box) {
    const textElement = box.querySelector(".text");

    if (!textElement) return;

    const fullText = textElement.innerText.trim();
    const shortText =
      fullText.substring(0, 100) + (fullText.length > 100 ? "..." : "");

    textElement.innerHTML = shortText + 
      (fullText.length > 100 ? ' <a href="#" class="read-more">Read more</a>' : "");

    if (fullText.length > 100) {
      const readMoreLink = textElement.querySelector(".read-more");

      readMoreLink.addEventListener("click", function (e) {
        e.preventDefault();

        if (textElement.innerHTML.startsWith(shortText)) {
          textElement.innerHTML = fullText + ' <a href="#" class="read-more">Read less</a>';
        } else {
          textElement.innerHTML = shortText + ' <a href="#" class="read-more">Read more</a>';
        }
        const newReadMoreLink = textElement.querySelector(".read-more");
        newReadMoreLink.addEventListener("click", arguments.callee);
      });
    }
  });
});



  // Copyright Year Update
  document.getElementById("year").textContent = new Date().getFullYear();
})(jQuery);
