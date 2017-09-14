/** This helper class makes it easier for us to do common operations on DIV
    objects, especially with respect to dynamically setting width and height
    so that the browser's display can be fully-utilized.  The key benefit
    of this code is the automatic handling of browser resize events.

    Direct support also exists for inserting a single frame that maxes out
    the available space in the div.
*/

function DivAssist(divID) {
  this.mDivID = divID;
  this.mDiv = $('#' + divID);
}

/* This gets dynamically modified as maximized elements are added. */
DivAssist.prototype.onResize = function() {
}

/* The profile contains non-obvious things that we might want to know about
   a DIV, such as the max available width and height available to
   this DIV if we wanted to max out the space or resize the DIV.  This
   is calculated relative to the entire client area.  

   As new functionality is introduced, we should update this function and the
   comment above accordingly.
 */
DivAssist.prototype.generateProfile = function() {
  var profile = {};
  var offset = this.mDiv.offset();

  var w=window.innerWidth || 
    document.documentElement.clientWidth ||
    document.body.clientWidth;

  var h=window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

  profile.maxWidth = w - offset.left;
  profile.maxHeight = h - offset.top - 5; // this 5 pixel adjustment prevents the need for an outer scrollbar in most circumstances
  profile.left = offset.left;
  profile.top = offset.top;

  profile.numParents = this.mDiv.parents('div').length;
  return profile;
}

DivAssist.prototype.maximizeHeight = function() {
  var profile = this.generateProfile();
  this.mDiv.css('height', profile.maxHeight + 'px');

  // account for resizing of browser
  var $self = this;
  DivAssist.prototype.onResize = (function() {
    var cachedFunction = DivAssist.prototype.onResize;
    return function() {
      cachedFunction.apply(this);
      var prof = $self.generateProfile();
      $self.mDiv.css('height', prof.maxHeight + 'px');
    }
    }());
  $(window).resize(DivAssist.prototype.onResize);
}

DivAssist.prototype.maximizeWidth = function() {
  var profile = this.generateProfile();
  this.mDiv.css('width', profile.maxWidth + 'px');

  // account for resizing of browser
  var $self = this;
  DivAssist.prototype.onResize = (function() {
    var cachedFunction = DivAssist.prototype.onResize;
    return function() {
      cachedFunction.apply(this);
      var prof = $self.generateProfile();
      $self.mDiv.css('width', prof.maxWidth + 'px');
    }
    }());
  $(window).resize(DivAssist.prototype.onResize);

};

DivAssist.prototype.setDimensions = function(width, height) {
  this.mDiv.css('width', width);
  this.mDiv.css('height', height);  
};

/* Maximizes size with resize capability.  Optionally, 
   specify width adjustment and/or height adjustment in pixels.  */
DivAssist.prototype.maximizeSize = function(o_widthDiff, o_heightDiff) {
  var profile = this.generateProfile();
  if (o_widthDiff)
    profile.maxWidth -= o_widthDiff;
  if (o_heightDiff)
    profile.maxHeight -= o_heightDiff;

  this.mDiv.css('width', profile.maxWidth + 'px');
  this.mDiv.css('height', profile.maxHeight + 'px');

  // account for resizing of browser
  var $self = this;
  DivAssist.prototype.onResize = (function() {
    var cachedFunction = DivAssist.prototype.onResize;
    return function() {
      cachedFunction.apply(this);
      var prof = $self.generateProfile();
      if (o_widthDiff)
        prof.maxWidth -= o_widthDiff;
      if (o_heightDiff)
        prof.maxHeight -= o_heightDiff;

      $self.mDiv.css('height', prof.maxHeight + 'px');
      $self.mDiv.css('width', prof.maxWidth + 'px');
    }
    }());
  $(window).resize(DivAssist.prototype.onResize);
}

DivAssist.prototype.addIframeColumn = function(name, src, width) {
  var profile = this.generateProfile();
  this.mDiv.css('width', width + 'px');

this.mDiv.css('height', profile.maxHeight + 'px');

  // frame height is slightly smaller to avoid vertical scrollbars in Chrome
  var frameHeight = profile.maxHeight-2;
  
  this.mDiv.html('<IFRAME id="iframe_' + name + '" name="' + name + '" src="' + src + '" width="' + width + '" height="' + frameHeight + '"></IFRAME>');  

  // account for resizing of browser
  var $self = this;
  DivAssist.prototype.onResize = (function() {
    var cachedFunction = DivAssist.prototype.onResize;
    return function() {
      cachedFunction.apply(this);
      var prof = $self.generateProfile();
      $self.mDiv.css('height', prof.maxHeight + 'px');
      var frame = document.getElementById('iframe_' + name);
      frame.style.height = prof.maxHeight-2 + 'px';
    }
    }());
  $(window).resize(DivAssist.prototype.onResize);
}

/* Max out size of DIV and insert IFRAME of equal size with auto resize when
   the user resizes the browser. */
  DivAssist.prototype.addMaxIframe = function(name, src, o_widthDiff, o_heightDiff) {
  var profile = this.generateProfile();
  if (o_widthDiff)
    profile.maxWidth -= o_widthDiff;
  if (o_heightDiff)
    profile.maxHeight -= o_heightDiff;
  this.mDiv.css('width', profile.maxWidth + 'px');
  this.mDiv.css('height', profile.maxHeight + 'px');
  this.mDiv.html('<IFRAME id="iframe_' + name + '" name="' + name + '" src="' + src + '" width="' + profile.maxWidth + '" height="' + (profile.maxHeight-2) + '"></IFRAME>');

  var root= document.compatMode=='BackCompat'? document.body : document.documentElement;
  var isVerticalScrollbar= root.scrollHeight>root.clientHeight;

  // Adjust for outer vertical scroll bar if it exists (not common)
  if (isVerticalScrollbar) {
    var frame = document.getElementById('iframe_' + name);
    this.mDiv.css('width', profile.maxWidth-15 + 'px');
    frame.style.width = profile.maxWidth-15 + 'px';
  }

  // account for resizing of browser
  var $self = this;
  DivAssist.prototype.onResize = (function() {
    var cachedFunction = DivAssist.prototype.onResize;
    return function() {
      cachedFunction.apply(this);
      var prof = $self.generateProfile();
      if (o_widthDiff)
        prof.maxWidth -= o_widthDiff;
      if (o_heightDiff)
        prof.maxHeight -= o_heightDiff;
      $self.mDiv.css('width', prof.maxWidth + 'px');
      $self.mDiv.css('height', prof.maxHeight + 'px');
      var frame = document.getElementById('iframe_' + name);
      frame.style.width = prof.maxWidth + 'px';
      frame.style.height = (prof.maxHeight - 2) + 'px';
      
      // adjust for outer vertical scrollbar if it exists (not common)
      var root= document.compatMode=='BackCompat'? document.body : document.documentElement;
      var isVerticalScrollbar= root.scrollHeight>root.clientHeight;
      if (isVerticalScrollbar) {
        $self.mDiv.css('width', prof.maxWidth-15 + 'px');
        frame.style.width = prof.maxWidth-15 + 'px';
      }            
    }
    }());
  $(window).resize(DivAssist.prototype.onResize);
}

//================================================
// static convenience functions
DivAssist.prototype.toConsole = function(divID) {
  var div = new DivAssist(divID);
  console.log(div.generateProfile());
}
