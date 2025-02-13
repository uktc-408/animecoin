document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  // --- Define threshold ---
  // When the canvas width is at least this value, we use full desktop mode.
  const desktopThreshold = 1024; // Otherwise, intermediate mode is used.

  // --- Resize canvas to fill the window ---
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log("Canvas resized to:", canvas.width, canvas.height);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // --- Preload Desktop Images ---
  // Base image (static background)
  const baseImage = new Image();
  baseImage.src = "bgrnone.png";
  baseImage.onload = () => { 
    console.log("Desktop base image loaded.");
  };
  baseImage.onerror = (e) => console.error("Error loading desktop base image:", e);

  // Desktop effect images array (one will be chosen at random)
  const effectImageSources = [
    "bgrdd.png",
    "bgrdg.png",
    "bgrld.png",
    "bgrlg.png",
    "bgrall.png",
    "bgrx1.png",
    "bgrx2.png"
  ];
  const effectImages = [];
  effectImageSources.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => console.log("Desktop effect image loaded:", src);
    img.onerror = (e) => console.error("Error loading desktop effect image:", src, e);
    effectImages.push(img);
  });

  // --- Effect state ---
  const effectState = {
    active: false,
    startTime: 0,
    effectImage: null
  };

  // --- Function to trigger an effect cycle ---
  function showEffect() {
    effectState.active = true;
    effectState.startTime = performance.now();
    // Always pick a random effect image from our desktop array.
    const randomIndex = Math.floor(Math.random() * effectImages.length);
    effectState.effectImage = effectImages[randomIndex];
    console.log("Effect triggered.");
  }

  // --- Render Loop ---
  function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Determine mode based on canvas width:
    // "desktopFull" when the canvas is at least desktopThreshold wide,
    // otherwise "intermediate" mode will crop the images.
    let mode;
    if (canvas.width >= desktopThreshold) {
      mode = "desktopFull";
    } else {
      mode = "intermediate";
    }

    // --- Draw the base image ---
    if (mode === "desktopFull") {
      if (baseImage.complete && baseImage.naturalWidth) {
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      }
    } else {
      // Intermediate mode: crop 25% off the left and 15% off the right.
      if (baseImage.complete && baseImage.naturalWidth) {
        const sx = 0.26 * baseImage.naturalWidth;
        // Total crop = 26% + 18% = 40%, so we draw the central 60%.
        const sWidth = baseImage.naturalWidth * 0.56;
        ctx.drawImage(baseImage, sx, 0, sWidth, baseImage.naturalHeight, 0, 0, canvas.width, canvas.height);
      }
    }

    // --- Draw the effect overlay if active ---
    if (effectState.active && effectState.effectImage) {
      const elapsed = (performance.now() - effectState.startTime) / 1000; // seconds
      let drawEffect = false;
      
      if (elapsed < 1) {
        // First 1 second: show steadily.
        drawEffect = true;
      } else if (elapsed < 2) {
        // Next 1 second: blink 3 times (each cycle ~0.333 sec; visible for the first half)
        const blinkCycle = 1 / 3;
        const blinkTime = elapsed - 1;
        if ((blinkTime % blinkCycle) < (blinkCycle / 2)) {
          drawEffect = true;
        }
      } else {
        // End effect after 2 seconds.
        effectState.active = false;
      }

      if (drawEffect) {
        if (mode === "desktopFull") {
          if (effectState.effectImage.complete && effectState.effectImage.naturalWidth) {
            ctx.drawImage(effectState.effectImage, 0, 0, canvas.width, canvas.height);
          }
        } else {
          // Intermediate mode: apply the same crop as the base image.
          if (effectState.effectImage.complete && effectState.effectImage.naturalWidth) {
            const sx = 0.26 * effectState.effectImage.naturalWidth;
            const sWidth = effectState.effectImage.naturalWidth * 0.56;
            ctx.drawImage(effectState.effectImage, sx, 0, sWidth, effectState.effectImage.naturalHeight, 0, 0, canvas.width, canvas.height);
          }
        }
      }
    }

    requestAnimationFrame(render);
  }

  // Start the render loop once the base image is loaded.
  if (baseImage.complete) {
    render();
  } else {
    baseImage.onload = render;
  }

  // --- Set up the repeating effect cycle ---
  // Each cycle: 2 seconds of effect (1 sec steady + 1 sec blinking)
  // then a 1.5 sec pause = 3.5 sec total.
  setInterval(showEffect, 3500);
});


// Listen for the Enter key on the terminal's input
document.addEventListener("DOMContentLoaded", () => {
  // Get element references
  const commandInput = document.getElementById("commandInput");
  const instructionLine = document.getElementById("instructionLine");
  const externalInput = document.getElementById("externalInput");
  const externalButton = document.getElementById("externalButton");

  // Update instruction based on terminal input changes.
  commandInput.addEventListener("input", () => {
    if (commandInput.value.trim() !== "") {
      instructionLine.textContent = "Press enter to proceed further";
    } else {
      instructionLine.textContent = "// Add input";
    }
  });

  // Function to handle terminal submission.
  function handleTerminalSubmit() {
    // If input is empty: blink the instruction for 1.5 seconds.
    if (commandInput.value.trim() === "") {
      instructionLine.classList.add("blink");
      setTimeout(() => {
        instructionLine.classList.remove("blink");
      }, 1500);
      return;
    }
    
    // Input is not empty: disable input, change prompt, and show loading message.
    commandInput.disabled = true;
    document.querySelector('.user-label').classList.add('disabled-prompt');
    document.querySelector('.prompt').classList.add('disabled-prompt');
    instructionLine.textContent = "// loading...";
    
    // Simulate a loading delay between 1500ms and 4500ms.
    const delay = Math.random() * (4500 - 1500) + 1500;
    setTimeout(() => {
      // Show error message and clear the input.
      instructionLine.textContent = "// Error, too many requests at the same time!";
      commandInput.value = "";
      
      // After a brief pause, reset the instruction and re-enable input.
      setTimeout(() => {
        instructionLine.textContent = "// Add input";
        commandInput.disabled = false;
        document.querySelector('.user-label').classList.remove('disabled-prompt');
        document.querySelector('.prompt').classList.remove('disabled-prompt');
        commandInput.focus();  // <-- This keeps the cursor in the terminal.
      }, 4000);
    }, delay);
  }

  // Listen for the Enter key on the terminal input.
  commandInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleTerminalSubmit();
    }
  });

  // Fullscreen Textbar Functionality:
  // When the search button is clicked...
  externalButton.addEventListener("click", () => {
    const text = externalInput.value.trim();
    if (text !== "") {
      // Transfer the text to the terminal input.
      commandInput.value = text;
      commandInput.dispatchEvent(new Event('input', { bubbles: true }));
      // Smoothly scroll down to the terminal container.
      document.getElementById("terminal").scrollIntoView({ behavior: "smooth" });
      
      // After a short delay, focus the terminal input and place the cursor at the end.
      setTimeout(() => {
        commandInput.focus();
        const len = commandInput.value.length;
        commandInput.setSelectionRange(len, len);
      }, 300);
    }
  });

  // Allow pressing Enter on the fullscreen textbar input to trigger the search.
  externalInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      externalButton.click();
    }
  });
});
