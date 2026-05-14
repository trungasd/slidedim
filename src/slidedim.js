function Slidedim(selector, options = {}) {
  this.container = document.querySelector(selector);
  if (!this.container) {
    console.error(`Slidedim: Container "${selector}" not found!`);
    return;
  }

  this.opt = Object.assign(
    {
      items: 1,
      speed: 0,
      loop: false,
      nav: true,
      controlsText: ["<", ">"],
      controls: true,
      prevButton: null,
      nextButton: null,
      slideBy: 1,
      autoPlay: false,
      stopAutoPlay: false,
      autoPlaySpeed: 3000,
    },
    options,
  );
  this.originalSlides = Array.from(this.container.children);
  this.slides = this.originalSlides.slice(0);
  this.currentIndex = this.opt.loop ? this._getCloneCount() : 0;

  this._init();
  this._updatePosition();
}

Slidedim.prototype._init = function () {
  this.container.classList.add("slidedim-wrapper");
  this._createContent();
  this._createTrack();

  const showNav = this._getSlideCount() > this.opt.items;

  if (this.opt.controls && showNav) {
    this._createControls();
  }

  if (this.opt.nav && showNav) {
    this._createNav();
  }

  this._autoPlaySlide();
};

Slidedim.prototype._autoPlaySlide = function () {
  if (!this.opt.autoPlay) return;

  this._startAutoPlay();

  if (this.opt.stopAutoPlay) {
    this.content.onmouseenter = () => this._clearAutoPlay();
    this.content.onmouseleave = () => this._startAutoPlay();
  }
};

Slidedim.prototype._startAutoPlay = function () {
  this._clearAutoPlay();
  this.autoPlayInterval = setInterval(() => {
    this.moveSlide(this._getSlideBy());
  }, this.opt.autoPlaySpeed);
};

Slidedim.prototype._clearAutoPlay = function () {
  if (this.autoPlayInterval) {
    clearInterval(this.autoPlayInterval);
  }
};

Slidedim.prototype._createContent = function () {
  this.content = document.createElement("div");
  this.content.className = "slidedim-content";

  this.container.appendChild(this.content);
};

Slidedim.prototype._getCloneCount = function () {
  const slideCount = this._getSlideCount();

  if (slideCount <= this.opt.items) return 0;

  const slideBy = this._getSlideBy();
  const cloneCount = slideBy + this.opt.items;

  return cloneCount > slideCount ? slideCount : cloneCount;
};

Slidedim.prototype._createTrack = function () {
  this.track = document.createElement("div");
  this.track.className = "slidedim-track";

  const cloneCount = this._getCloneCount();

  if (this.opt.loop && cloneCount > 0) {
    const cloneHead = this.slides
      .slice(-cloneCount)
      .map((node) => node.cloneNode(true));
    const cloneTail = this.slides
      .slice(0, cloneCount)
      .map((node) => node.cloneNode(true));

    this.slides = cloneHead.concat(this.slides.concat(cloneTail));
  }

  this.slides.forEach((slide) => {
    slide.classList.add("slidedim-slide");
    slide.style.flexBasis = `calc(100% / ${this.opt.items})`;
    this.track.appendChild(slide);
  });

  this.content.appendChild(this.track);
};

Slidedim.prototype._getSlideBy = function () {
  return this.opt.slideBy === "page" ? this.opt.items : this.opt.slideBy;
};

Slidedim.prototype._createControls = function () {
  this.prevBtn = this.opt.prevButton
    ? document.querySelector(this.opt.prevButton)
    : document.createElement("button");

  this.nextBtn = this.opt.nextButton
    ? document.querySelector(this.opt.nextButton)
    : document.createElement("button");

  if (!this.opt.prevButton) {
    this.prevBtn.textContent = this.opt.controlsText[0];
    this.prevBtn.className = "slidedim-prev";
    this.content.appendChild(this.prevBtn);
  }

  if (!this.opt.nextButton) {
    this.nextBtn.textContent = this.opt.controlsText[1];
    this.nextBtn.className = "slidedim-next";
    this.content.appendChild(this.nextBtn);
  }

  const slideBy = this._getSlideBy();

  this.prevBtn.onclick = () => this.moveSlide(-slideBy);
  this.nextBtn.onclick = () => this.moveSlide(slideBy);
};

Slidedim.prototype._getSlideCount = function () {
  return this.originalSlides.length;
};

Slidedim.prototype._createNav = function () {
  this.navWrapper = document.createElement("div");
  this.navWrapper.className = "slidedim-nav";

  const slideCount = this._getSlideCount();
  const pageCount = Math.ceil(slideCount / this.opt.items);

  for (let i = 0; i < pageCount; i++) {
    const dot = document.createElement("button");
    dot.className = "slidedim-dot";

    if (i === 0) dot.classList.add("active");

    dot.onclick = () => {
      this.currentIndex = this.opt.loop
        ? i * this.opt.items + this._getCloneCount()
        : i * this.opt.items;
      this._updatePosition();
    };

    this.navWrapper.appendChild(dot);
  }

  this.container.appendChild(this.navWrapper);
};

Slidedim.prototype.moveSlide = function (step) {
  if (this._isAnimating) return;
  this._isAnimating = true;

  const maxIndex = this.slides.length - this.opt.items;
  this.currentIndex += step;

  if (!this.opt.loop) {
    this.currentIndex = Math.min(
      Math.max(this.currentIndex + step, 0),
      maxIndex,
    );
  }

  setTimeout(() => {
    if (this.opt.loop) {
      const slideCount = this._getSlideCount();

      if (this.currentIndex <= this._getCloneCount()) {
        this.currentIndex += slideCount;
        this._updatePosition(true);
      } else if (this.currentIndex >= slideCount) {
        this.currentIndex -= slideCount;
        this._updatePosition(true);
      }
    }
    this._isAnimating = false;
  }, this.opt.speed);

  this._updatePosition();
};

Slidedim.prototype._updateNav = function () {
  if (!this.navWrapper) return;

  let realIndex = this.currentIndex;

  if (this.opt.loop) {
    const slideCount = this._getSlideCount();
    realIndex =
      (this.currentIndex - this._getCloneCount() + slideCount) % slideCount;
  }

  const pageIndex = Math.floor(realIndex / this.opt.items);

  const dot = Array.from(this.navWrapper.children);

  dot.forEach((dot, index) => {
    dot.classList.toggle("active", index === pageIndex);
  });
};

Slidedim.prototype._updatePosition = function (instant = false) {
  this.track.style.transition = instant
    ? "none"
    : `transform ease ${this.opt.speed}ms`;
  this.offset = -(this.currentIndex * (100 / this.opt.items));
  this.track.style.transform = `translateX(${this.offset}%)`;

  if (this.opt.nav && !instant) {
    this._updateNav();
  }
};
