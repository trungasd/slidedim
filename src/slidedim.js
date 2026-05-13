function Slidedim(selector, options = {}) {
  this.container = document.querySelector(selector);
  if (!this.container) {
    console.error(`Slidedim: Container "${selector}" not found!`);
    return;
  }

  this.opt = Object.assign(
    {
      items: 0,
      speed: 0,
      loop: false,
      nav: true,
      controlsText: ["<", ">"],
      controls: true,
      prevButton: null,
      nextButton: null,
      slideBy: 1,
    },
    options,
  );
  this.slides = Array.from(this.container.children);
  this.currentIndex = this.opt.loop ? this.opt.items : 0;

  this._init();
  this._updatePosition();
}

Slidedim.prototype._init = function () {
  this.container.classList.add("slidedim-wrapper");
  this._createContent();
  this._createTrack();

  if (this.opt.controls) {
    this._createControls();
  }

  if (this.opt.nav) {
    this._createNav();
  }
};

Slidedim.prototype._createContent = function () {
  this.content = document.createElement("div");
  this.content.className = "slidedim-content";

  this.container.appendChild(this.content);
};

Slidedim.prototype._createTrack = function () {
  this.track = document.createElement("div");
  this.track.className = "slidedim-track";

  if (this.opt.loop) {
    const cloneHead = this.slides
      .slice(-this.opt.items)
      .map((node) => node.cloneNode(true));
    const cloneTail = this.slides
      .slice(0, this.opt.items)
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

  const stepSize =
    this.opt.slideBy === "page" ? this.opt.items : this.opt.slideBy;

  this.prevBtn.onclick = () => this.moveSlide(-stepSize);
  this.nextBtn.onclick = () => this.moveSlide(stepSize);
};

Slidedim.prototype._createNav = function () {
  this.navWrapper = document.createElement("div");
  this.navWrapper.className = "slidedim-nav";

  const slideCount =
    this.slides.length - (this.opt.loop ? this.opt.items * 2 : 0);
  const pageCount = Math.ceil(slideCount / this.opt.items);

  for (let i = 0; i < pageCount; i++) {
    const dot = document.createElement("button");
    dot.className = "slidedim-dot";

    if (dot === 0) dot.classList.add("active");

    dot.onclick = () => {
      this.currentIndex = this.opt.loop
        ? i * this.opt.items + this.opt.items
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

  this.currentIndex = Math.min(Math.max(this.currentIndex + step, 0), maxIndex);
  setTimeout(() => {
    if (this.opt.loop) {
      if (this.currentIndex <= 0) {
        this.currentIndex = maxIndex - this.opt.items;
        this._updatePosition(true);
      } else if (this.currentIndex >= maxIndex) {
        this.currentIndex = this.opt.items;
        this._updatePosition(true);
      }
    }
    this._isAnimating = false;
  }, this.opt.speed);

  this._updatePosition();
};

Slidedim.prototype._updateNav = function () {
  let realIndex = this.currentIndex;

  if (this.opt.loop) {
    const slideCount = this.slides.length - this.opt.items * 2;
    realIndex = (this.currentIndex - this.opt.items + slideCount) % slideCount;
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
