class MainSlider extends HTMLElement {
  constructor() {
    super();
    // const slider = document.querySelector('.slider-main');
    // const observer = new MutationObserver(function (mutations) {
    //   mutations.forEach(function (mutation) {
    //     if (mutation.type === 'childList') {
    //       this.destroy();
    //       this.slick();
    //     }
    //   });
    // });
    // observer.observe(slider, {childList: true});
    this.slick();
  }

  slick() {
    $(document).ready(() => {
      $('.slider-main').slick({
        dots: false,
        arrows: false,
        autoplay: !!this.dataset.autoplay,
        autoplaySpeed: this.dataset.autoplaySpeed ? parseInt(this.dataset.autoplaySpeed) * 1000 : 3000,
        infinite: !!this.dataset.infinite,
      });
    });
  }

  destroy() {
    $('.slider-main').slick('destroy');
  }
}
customElements.define('main-slider', MainSlider);
