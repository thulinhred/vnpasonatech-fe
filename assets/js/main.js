let main = (function () {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {

    if (!select(el, all)) {
      return;
    }

    if (all) {
      select(el, all).forEach(e => e.addEventListener(type, listener))
    } else {
      select(el, all).addEventListener(type, listener)
    }
  }
  /**
   * 
   */
  const openHistory = function (index) {
    let pageHistory = window.location.href.indexOf("company");

    if (pageHistory >= 0) {
      let hash = parseInt(window.location.hash.substr(1));
      let header = select('#header');
      let offset = header.offsetHeight;
      let selectors = select('.office .container .row', true);

      if (!header.classList.contains('header-scrolled')) {
        offset -= 10
      }
      if (index >= 0 || hash >= 0) {
        let top = selectors[index >= 0 ? index : hash].offsetTop;

        window.scrollTo({
          top: top - offset,
          behavior: 'smooth'
        })
      }

    } else {
      if (index >= 0) {
        window.location.href = "./company#" + index;
      }
    }
    return false;
  }

  /**
   * 
   * @param {*} nameJson 
   */
  function eventPageContact(data) {
    on('submit', '.contact form', function (e) {
      validated([this.elements["radio-group"],
        this.elements["name"],
        this.elements["email"],
        this.elements["tel"],
        this.elements["comment"],
        this.elements["accept-terms"]
      ]);

      e.preventDefault();
      e.stopPropagation();
    })

    on('focusout', '.contact input', function (e) {
      validated([this]);
    }, true);

    on('focusout', '.contact textarea', function (e) {
      validated([this]);
    }, true);

    on('click', '.contact input[type=checkbox]', function (e) {
      validated([this]);
    }, true);

    on('click', '[name=radio-group]', function (e) {
      document.getElementById("service").querySelector('.error').innerHTML =  "";
      const selectEle = select('.content-service');
      let display = "none";
      selectEle.innerHTML = "";
      let vl = this.value;

      data.service.forEach(function name(item) {
          if(vl && item.value == vl){
            selectEle.insertAdjacentHTML('beforeend', item.type.map(function (i){return '<option value="' + i+ '">'+ i +'</option>'}).join("\n") );
            display = "block";
          }
      })
      select('.content-service').style.display = display;
    }, true)

    function validated(eles) {
      let err = false;
      let errEle;
      let txt = "";

      eles.forEach(function name(ele) {
        const name = ele && ele.name;
        const val = ele.value;
        errEle = ele.parentNode && (ele.parentNode.querySelector('.error') || ele.parentNode.parentNode.querySelector('.error'));

        if (name == "name") {
          txt = (val.length <= 1) ? data.mess_name.only_one : "";
          txt = (val.length == 0) ? data.mess_name.empty : txt;
        }

        if (name == "email") {
          txt = !(/\S+@\S+\.\S+/.test(val)) ? data.mess_email.wrong : "";
          txt = (val.length == 0) ? data.mess_email.empty : txt;
        }

        if (name == "tel") {
          const match = val.match(/\s*(?:\+?(\d{1,2}))?[-. ]*(\d{2,3})[-. ]*(\d{3,4})[-. ]*(\d{3,4})(?: *x(\d+))?\s*$/im);
          txt = (!match) ? data.mess_tel.wrong : "";
        }

        if (name == "comment") {
          txt = (val.length <= 1) ? data.mess_comment.only_one : "";
          txt = (val.length == 0) ? data.mess_comment.empty : txt;
        }

        if (name == "accept-terms") {
          txt = (!ele.checked) ? data.mess_accept_term : "";
        }

        if (ele[0] && ele[0].name == 'radio-group') {
          const arrChecked = Array.from(ele).filter(function name(ele) {
            return ele.checked;
          })

          errEle = ele[0].parentNode.parentNode.querySelector('.error');
          txt = (arrChecked == 0) ? data.mess_chosen_service : "";
        }

        errEle.innerText = txt;
        if (txt) {
          err = true;
        }
      })

      return err;
    }

    var openDrop = false;

    on("click", ".flag", function (e) {
      openDrop = !openDrop;
      select('.lang-phone').style.opacity = openDrop ? "1" : "0";
      select('.lang-phone').style.visibility = openDrop ? "visible" : "hidden";
      select('.lang-phone').style.zIndex = openDrop ? "1" : "-1";
    })

    on("click", 'body', function (e) {
      if(!select('.select-flag')) return;
      const smTar = select('.select-flag').contains(e.target);
      select('.lang-phone').style.visibility = smTar ? "" : "hidden";
      select('.flag').style.boxShadow = smTar ? "0 0 0 0.2rem hsl(357deg 73% 42% / 20%)" : "";
    })

    on("click", '.lang-phone', function (e) {
      const tagName = e.target.tagName.toLowerCase();
      let liEle = e.target;

      if (tagName == "ul") {
        return;
      }

      if (tagName == "img" || tagName == "span") {
        liEle = e.target.parentNode;
      }

      select('.flag').innerHTML = liEle.innerHTML;

      select('.lang-phone').style.opacity = "0";
      select('.lang-phone').style.visibility = "hidden";
      select('.lang-phone').style.zIndex = "-1";

      openDrop = false;

    })


    ///
    on('click', '.other .right', function (e) {
      window.location.href = './' + select('.other .right').dataset.url;
    }, true);

    on('click', '.other .left', function (e) {
      window.location.href = './' + select('.other .left').dataset.url;
    }, true);
  }

  function loadHtml(nameJson, activeIndex) {

    Promise.all([
        fetch('./assets/json/header.json').then(response => {
          return response.json()
        }),
        fetch('./assets/json/footer.json').then(response => {
          return response.json()
        }),
        fetch('./assets/json/' + nameJson + '.json').then(response => {
          if (!response.ok) {
            throw new Error("HTTP error " + response.status);
          }
          return response.json();
        })
      ]).then(jsons => {
        
        let locale = localStorage.getItem("lang");
        locale = locale ? locale : "ja";
        select('html').lang = locale;
        
        if(locale === "vn"){
          document.documentElement.style.setProperty('--font-en', 'Roboto');

        }

        const htmlHeader = Mustache.to_html('<header id="header" class="header fixed-top"> <div class="container-flud d-flex justify-content-between align-items-center "> <a href="./" class="logo d-flex align-items-center"> <img src="assets/img/PTVLogo.png" alt=""> </a> <nav id="navbar" class="navbar"> <ul> <li class="dropdown"> <a class="nav-link scrollto"> {{profile}} <i class="bi bi-chevron-down"></i> </a> <ul> <li><a href="./message">{{message}} </a></li> <li><a href="./company" target="_self">{{company}}</a></li> <li><a href="./history" target="_self">{{history}}</a></li> </ul> </li> <li class="dropdown"> <a class="nav-link scrollto" href="#service">{{service}} <i class="bi bi-chevron-down"></i></a> <ul> <li><a href="./it">{{it}}</a></li> <li><a href="./bpo">{{bpo}}</a></li> <li><a href="./hr">{{hr}}</a></li> </ul> </li> <li><a class="nav-link scrollto" href="./blog">{{blog}}</a></li> <li><a class="nav-link scrollto" href="./news">{{news}}</a></li> <li><a class="nav-link scrollto" href="./recruit">{{recruit}}</a></li> <li><a class="nav-link scrollto" href="./fqa">{{fqa}}</a></li> <li><a class="nav-link sub-contact scrollto" href="./contact">{{contact}}</a></li> <li> <div class="logo-group"> <a href="https://www.facebook.com/PasonaTechVietnam" class="nav-link-social" target="_blank"> <?xml version="1.0" encoding="utf-8"?> <svg class="fb" width="28" height="29" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"> <path d="M1579 128q35 0 60 25t25 60v1366q0 35-25 60t-60 25h-391v-595h199l30-232h-229v-148q0-56 23.5-84t91.5-28l122-1v-207q-63-9-178-9-136 0-217.5 80t-81.5 226v171h-200v232h200v595h-735q-35 0-60-25t-25-60v-1366q0-35 25-60t60-25h1366z" fill="#444444" /></svg> </a> <a href="https://www.linkedin.com/company/pasonatech-vietnam" class="nav-link-social" target="_blank"> <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="lk" class="bi bi-linkedin" viewBox="0 0 16 16"> <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" /> </svg> </a> </div> </li> <li class="dropdown"> <a class="nav-link scrollto" href="#about">{{lang}} <i class="bi bi-chevron-down"></i></a> <ul class="lang"> <li><img src="./assets/img/language/jp.svg"><a href="#" data-lang="ja"> 日本語</a></li> <li><img src="./assets/img/language/gb.svg"><a href="#" data-lang="en"> English</a></li> <li><img src="./assets/img/language/vn.svg"> <a href="#" data-lang="vn">Tiếng Việt</a> </li> <li><img src="./assets/img/language/kr.svg"><a href="#" data-lang="kr"> 한국</a></li> </ul> </li> </ul> <i class="bi bi-list mobile-nav-toggle"></i> </nav> </div> </header> <!-- End Header -->', jsons[0][locale]);
        select('.header').outerHTML = htmlHeader;

        activeIndex &&  select('.navbar ul li:nth-child(' + activeIndex +') a').classList.add('active');

        if(select('.footer')){
          const htmlFooter = Mustache.to_html('<a href="#" class="back-to-top"> <div class="top"></div> <div class="arrow-up"></div> Top </a><!-- ======= Footer ======= --> <footer id="footer" class="footer"> <div class="footer-top"> <div class="container"> <div class="row gy-4 d-flex flex-direction-column justify-content-center"> <div class=" footer-links-par col-lg-6 col-md-12  col-sm-12 d-flex justify-content-between"> <div class="footer-links  "> <h4>{{about}}</h4> <ul> <li><a href="#">{{message}}</a></li> <li><a href="#">{{company}}</a></li> <li><a href="#">{{history}}</a></li> </ul> </div> <div class="footer-links  "> <h4>What we do</h4> <ul> <li><a href="#">{{it}} </a></li> <li><a href="#">{{bpo}} </a></li> <li><a href="#">{{hr}} </a></li> </ul> </div> <div class="footer-links  "> <h4>Update</h4> <ul> <li><a href="#">{{blog}} </a></li> <li><a href="#">{{news}} </a></li> <li><a href="./recruit">{{recruit}} </a></li> <li><a href="#">{{interview}} </a></li> </ul> </div> <div class="footer-links  "> <h4>Contact</h4> <ul> <li><a href="#">{{contact}} </a></li> <li><a href="#">{{faq}} </a></li> </ul> </div> </div> </div> </div> </div> <div class="container"> <div class="copyright d-flex"> <p> ©PASONA TECH VIETNAM CO., LTD.</p> <a href="./policy">{{policy}}</a> </div> </div> </footer> <!-- End Footer -->', jsons[1][locale]);
          select('.footer').outerHTML = htmlFooter;
        }

        for (const idx in jsons[2][locale]) {
          
          const ob = jsons[2][locale][idx];

          if(Array.isArray(ob)) {
            ob.forEach(function (item, idx) {
              item["idx"] = idx.toString();
            })
          }
        }
        
        var targetContainer = select(".target-layout"),
          template = select("#template").innerHTML;

        var html = Mustache.to_html(template, jsons[2][locale]);
        targetContainer.outerHTML = html;

        main.select("#template").outerHTML = "";

        on("click", ".lang a", function (e) {
          localStorage.setItem("lang", e.target.dataset.lang);
          location.reload();
        }, true)

        /**
         * Easy on scroll event listener 
         */
        const onscroll = (el, listener) => {
          el.addEventListener('scroll', listener)
        }

        /**
         * Toggle .header-scrolled class to #header when page is scrolled
         */
        let selectHeader = select('#header')
        if (selectHeader) {
          const headerScrolled = () => {

            if (window.scrollY > 100) {
              selectHeader.classList.add('header-scrolled')
            } else {
              selectHeader.classList.remove('header-scrolled')
            }
            select('.navbar ul').style.top = selectHeader.clientHeight - 4 + "px";
          }
          window.addEventListener('load', headerScrolled)
          onscroll(document, headerScrolled)
        }
        /**
         * Back to top button
         */
        let backtotop = select('.back-to-top');
        if (backtotop) {
          const toggleBacktotop = () => {
            if (window.scrollY > 100) {
              backtotop.classList.add('active');
            } else {
              backtotop.classList.remove('active');
            }
          }
          window.addEventListener('load', toggleBacktotop)
          onscroll(document, toggleBacktotop)
        }

        /**
         * Mobile nav toggle
         */
        on('click', '.mobile-nav-toggle', function (e) {
          // select('body').style.overflow = select('#navbar').classList.contains('navbar-mobile')? 'hidden' : '';
          select('#navbar').classList.toggle('navbar-mobile');
          select('#navbar ul').style.top = select("#header").offsetHeight + "px"
          this.classList.toggle('bi-list')
          this.classList.toggle('bi-x')
        })

        /**
         * Mobile nav dropdowns activate
         */
        on('click', '.navbar .dropdown > a', function (e) {
          if (select('#navbar').classList.contains('navbar-mobile')) {
            e.preventDefault();
            var eleIcon = e.target.parentNode.querySelectorAll('.bi');
            var ele = select(".dropdown-active");
            ele && (ele != this.nextElementSibling) && ele.classList.toggle('dropdown-active');
            this.nextElementSibling.classList.toggle('dropdown-active');
            eleIcon[0].className = eleIcon[0].classList.contains('bi-chevron-down') ? 'bi bi-chevron-up' : 'bi bi-chevron-down';
          }
        }, true)

        /**
         * Scroll with ofset on page load with hash links in the url
         */
        window.addEventListener('load', () => {
          if (window.location.hash) {
            if (select(window.location.hash)) {
              scrollto(window.location.hash)
            }
          }
        });

        /**
         * Animation on scroll
         */
        function aos_init() {
          AOS.init({
            duration: 1000,
            easing: "ease-in-out",
            once: true,
            mirror: false,
            offset: 20
          });
        }
        aos_init();
        /**
         * swiper
         */
        new Swiper('.hero-slider', {
          effect: 'fade',
          fadeEffect: {
            crossFade: true
          },
          speed: 2000,
          loop: true,
          autoplay: {
            delay: 5000,
            disableOnInteraction: true,
          },
        });
        /**
         * move page on fag
         */
        on('click', '.faq-category .faq-header button', function (e) {
          let index = select('.faq-category .faq-header button', true).indexOf(e.target);
          let eles = select('.faq-content .row', true);
          let header = select('#header');
          let offset = header.offsetHeight;

          if (!header.classList.contains('header-scrolled')) {
            offset -= 10
          }

          let elementPos = eles[index].offsetTop
          window.scrollTo({
            top: elementPos - offset,
            behavior: 'smooth'
          })
        }, true)

        openHistory();
        eventPageContact(jsons[2][locale])
      })
      .catch(function () {
        this.dataError = true;
      })
  }

  return {
    openHistory: openHistory,
    select: select,
    on: on,
    loadHtml: loadHtml
  }

})();
