let scene, camera, renderer, cards = [], raycaster, mouse;
let formationComplete = false;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.set(0, 4, 8);
  camera.lookAt(scene.position);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  addLighting();
  createCards();

  document.addEventListener('mousemove', onMouseMove, false);

  animate();
}

function createCardTexture(anime) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 190;
    canvas.height = 254;
    const ctx = canvas.getContext('2d');

    // Old paper background
    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(0, 0, 190, 254);

    // Add texture and stains to the paper
    ctx.fillStyle = 'rgba(160, 82, 45, 0.1)';
    for (let i = 0; i < 5000; i++) {
      ctx.fillRect(Math.random() * 190, Math.random() * 254, 1, 1);
    }

    // Add some darker stains
    ctx.fillStyle = 'rgba(101, 67, 33, 0.2)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 190;
      const y = Math.random() * 254;
      const radius = Math.random() * 20 + 5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Torn edges effect
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 190; i += 5) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i + Math.random() * 5, Math.random() * 5);
    }
    for (let i = 0; i < 254; i += 5) {
      ctx.moveTo(190, i);
      ctx.lineTo(190 - Math.random() * 5, i + Math.random() * 5);
    }
    for (let i = 190; i > 0; i -= 5) {
      ctx.moveTo(i, 254);
      ctx.lineTo(i - Math.random() * 5, 254 - Math.random() * 5);
    }
    for (let i = 254; i > 0; i -= 5) {
      ctx.moveTo(0, i);
      ctx.lineTo(Math.random() * 5, i - Math.random() * 5);
    }
    ctx.stroke();

    // Anime title
    ctx.fillStyle = '#000';
    ctx.font = 'bold 18px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText(anime.title, 95, 30);

    // Anime description
    ctx.font = '14px "Times New Roman", serif';
    ctx.textAlign = 'left';
    const words = anime.description.split(' ');
    let line = '';
    let y = 60;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > 170 && n > 0) {
        ctx.fillText(line, 10, y);
        line = words[n] + ' ';
        y += 16;
      }
      else {
        line = testLine;
      }
    }
    ctx.fillText(line, 10, y);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    resolve(texture);
  });
}

async function createCards() {
  const animeData = [
    { title: "Attack on Titan", description: "Set in a world where humanity faces extinction from giant Titans, the story follows Eren Yeager and his friends as they join the military to fight the Titans and uncover the mysteries of their world." },
    { title: "Demon Slayer", description: "After his family is slaughtered and his sister turned into a demon, Tanjiro Kamado becomes a demon slayer to avenge his family and cure his sister, joining the Demon Slayer Corps." },
    { title: "One Piece", description: "Monkey D. Luffy sets out to find the treasure One Piece and become the Pirate King. With his crew, he sails the Grand Line, encountering friends and foes, and uncovering world mysteries." },
    { title: "Naruto", description: "Following Naruto Uzumaki, a young ninja seeking recognition and dreaming of becoming the Hokage, the series explores his growth from a mischievous outcast to a powerful ninja." },
    { title: "Dragon Ball", description: "Chronicling Goku's life from childhood to adulthood, the series follows his martial arts training and search for the Dragon Balls, defending Earth against progressively more powerful threats." },
    { title: "My Hero Academia", description: "In a world where superpowers are common, Izuku Midoriya is born without them. He inherits a power from the world's greatest hero and begins his journey at UA High School." },
    { title: "Death Note", description: "When Light Yagami finds a notebook that kills anyone whose name is written in it, he begins a quest to rid the world of evil, facing off against the enigmatic detective L." },
    { title: "Fullmetal Alchemist", description: "Brothers Edward and Alphonse Elric use alchemy in their quest to restore their bodies after a failed attempt to revive their mother, uncovering a nationwide conspiracy." }
  ];

  for (let i = 0; i < animeData.length; i++) {
    const texture = await createCardTexture(animeData[i]);
    const cardGeometry = new THREE.PlaneGeometry(1.9, 2.54);
    const cardMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
      emissive: 0x222222,
      shininess: 10
    });
    const card = new THREE.Mesh(cardGeometry, cardMaterial);
    card.position.set(-10, 0, 0);  // Start off-screen
    card.userData.index = i;  // Store the index for later use
    cards.push(card);
    scene.add(card);
  }

  startCardEntryAnimation();
}

function addLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function startCardEntryAnimation() {
  cards.forEach((card, index) => {
    const angle = (index / 8) * Math.PI * 2;
    const targetX = Math.cos(angle) * 4;
    const targetZ = Math.sin(angle) * 4;

    gsap.to(card.position, {
      x: targetX,
      z: targetZ,
      duration: 2,
      delay: index * 0.5,
      ease: "power2.out",
      onUpdate: () => {
        card.rotation.y = Math.atan2(card.position.x, card.position.z);
      },
      onComplete: () => {
        if (index === cards.length - 1) {
          formationComplete = true;
          startRotationAnimation();
        }
      }
    });
  });
}

function startRotationAnimation() {
  const rotationDuration = 45;

  gsap.to({}, {
    duration: rotationDuration,
    repeat: -1,
    ease: "none",
    onUpdate: function () {
      const progress = this.progress();
      const time = progress * Math.PI * 2;

      cards.forEach((card, index) => {
        const angle = time + index * (Math.PI * 2 / 8);
        card.position.x = Math.cos(angle) * 4;
        card.position.z = Math.sin(angle) * 4;
        card.rotation.y = Math.atan2(card.position.x, card.position.z);
      });
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cards);

  cards.forEach(card => {
    if (intersects.length > 0 && intersects[0].object === card) {
      card.material.emissive.setHex(0x444444);
    } else {
      card.material.emissive.setHex(0x222222);
    }
  });

  renderer.render(scene, camera);
}

init();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
