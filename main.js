import './style.css'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

let canvasWidth = window.innerWidth
let canvasHeight = window.innerHeight
const canvasRadius = Math.min(canvasWidth, canvasHeight) / 2

canvas.width = canvasWidth
canvas.height = canvasHeight

const colors = ['#C8E6C9']

const gravityControl = document.getElementById('gravity')
const frictionControl = document.getElementById('friction')
const collisionMarginControl = document.getElementById('collisionMargin')
const ballCountControl = document.getElementById('ballCount')
const ballSizeControl = document.getElementById('ballSize')
const impulseClickControl = document.getElementById('impulseClick')
const impulseMoveControl = document.getElementById('impulseMove')

let gravity = 0.1
let friction = 0.99
let collisionMargin = 0
let ballCount = 1000
let ballSize = 5
let impulseClick = 1000
let impulseMove = 100

// Event listeners para los eventos del HTML
gravityControl.addEventListener('input', () => {
  gravity = parseFloat(gravityControl.value)
})

frictionControl.addEventListener('input', () => {
  friction = parseFloat(frictionControl.value)
})

collisionMarginControl.addEventListener('input', () => {
  collisionMargin = parseFloat(collisionMarginControl.value)
})

ballSizeControl.addEventListener('input', () => {
  ballSize = parseFloat(ballSizeControl.value)
  init()
})

ballCountControl.addEventListener('input', () => {
  ballCount = parseInt(ballCountControl.value)
  const newBallCount = parseInt(ballCountControl.value)
  if (newBallCount > ballArray.length) {
    // Agregar nuevas bolas si el nuevo recuento es mayor
    for (let i = ballArray.length; i < newBallCount; i++) {
      const radius = ballSize
      const x = randomIntFromRange(radius, canvas.width - radius)
      const y = randomIntFromRange(0, canvas.height - radius)
      const dx = randomIntFromRange(-3, 3)
      const dy = randomIntFromRange(-2, 2)
      ballArray.push(new Ball(x, y, dx, dy, radius, randomColor(colors)))
    }
  } else if (newBallCount < ballArray.length) {
    // Eliminar bolas si el nuevo recuento es menor
    ballArray.splice(newBallCount)
  }
})

impulseClickControl.addEventListener('input', () => {
  impulseClick = parseFloat(impulseClickControl.value)
})

impulseMoveControl.addEventListener('input', () => {
  impulseMove = parseFloat(impulseMoveControl.value)
})

// Event listeners para los eventos de cambio de tamaño, desplazamiento y click
window.addEventListener('resize', handleWindowResize)

canvas.addEventListener('click', handleCanvasClick)

canvas.addEventListener('mousedown', () => {
  isMousePressed = true
})

canvas.addEventListener('mouseup', () => {
  isMousePressed = false
})

canvas.addEventListener('mousemove', handleCanvasMove)

// Funciones generales
function randomIntFromRange (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomColor (colors) {
  return colors[Math.floor(Math.random() * colors.length)]
}

function hexToRgb (hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null
}

function rgbToHex (rgb) {
  return `#${Math.round(rgb[0]).toString(16).padStart(2, '0')}${Math.round(rgb[1]).toString(16).padStart(2, '0')}${Math.round(rgb[2]).toString(16).padStart(2, '0')}`
}

let isMousePressed = false

function handleCanvasClick (event) {
  const mouseX = event.clientX
  const mouseY = event.clientY

  // Calcular la dirección desde el punto de clic hasta el centro de cada bola
  for (const ball of ballArray) {
    const directionX = ball.x - mouseX
    const directionY = ball.y - mouseY

    // Calcular la distancia entre la bola y el punto de clic
    const distance = Math.sqrt(directionX ** 2 + directionY ** 2)

    // Aplicar un impulso inversamente proporcional a la distancia
    const newImpulseStrength = impulseClick / distance

    // Aplicar el impulso a las velocidades de la bola
    ball.dx += newImpulseStrength * (directionX / distance)
    ball.dy += newImpulseStrength * (directionY / distance)
  }
}

function handleCanvasMove (event) {
  if (isMousePressed) {
    const mouseX = event.clientX
    const mouseY = event.clientY

    // Calcular la dirección desde el punto de movimiento hasta el centro de cada bola
    for (const ball of ballArray) {
      const directionX = ball.x - mouseX
      const directionY = ball.y - mouseY

      // Calcular la distancia entre la bola y el punto de movimiento
      const distance = Math.sqrt(directionX ** 2 + directionY ** 2)

      // Aplicar un impulso inversamente proporcional a la distancia
      const impulseStrength = impulseMove / distance

      // Aplicar el impulso a las velocidades de la bola
      ball.dx += impulseStrength * (directionX / distance)
      ball.dy += impulseStrength * (directionY / distance)
    }
  }
}

function interpolateColor (currentColor, targetColor, speed) {
  const currentRGB = hexToRgb(currentColor)
  const targetRGB = hexToRgb(targetColor)

  for (let i = 0; i < 3; i++) {
    currentRGB[i] += (targetRGB[i] - currentRGB[i]) * speed
  }

  return rgbToHex(currentRGB)
}

function handleWindowResize () {
  canvasWidth = window.innerWidth
  canvasHeight = window.innerHeight

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  // Ajustar las posiciones de las bolas según las nuevas dimensiones
  for (const ball of ballArray) {
    ball.x = Math.min(ball.x, canvasWidth - ball.radius)
    ball.y = Math.min(ball.y, canvasHeight - ball.radius)
  }
}

function updateCanvasSize () {
  canvasWidth = window.innerWidth
  canvasHeight = window.innerHeight
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  for (const ball of ballArray) {
    // Ajustar las posiciones de las bolas al nuevo tamaño del lienzo
    if (ball.x + ball.radius > canvasWidth) {
      ball.x = canvasWidth - ball.radius
    }
    if (ball.y + ball.radius > canvasHeight) {
      ball.y = canvasHeight - ball.radius
    }
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius
    }
  }
}

let lastWindowX = window.screenX || window.screenLeft
let lastWindowY = window.screenY || window.screenTop

function handleWindowMove () {
  const windowX = window.screenX || window.screenLeft
  const windowY = window.screenY || window.screenTop

  if (windowX !== lastWindowX || windowY !== lastWindowY) {
    // Calcular la diferencia en las coordenadas de la ventana desde la última posición conocida
    const deltaX = lastWindowX - windowX // Invertir la dirección en X
    const deltaY = lastWindowY - windowY // Invertir la dirección en Y

    // Ajustar las posiciones de las bolas en relación con la diferencia en las coordenadas
    for (const ball of ballArray) {
      ball.x += deltaX
      ball.y += deltaY
    }

    // Actualizar las coordenadas de la última posición conocida
    lastWindowX = windowX
    lastWindowY = windowY
  }

  // Continuar el bucle de animación
  window.requestAnimationFrame(handleWindowMove)
}

class Ball {
  constructor (x, y, dx, dy, radius, color) {
    this.x = x
    this.y = y
    this.dx = dx
    this.dy = dy
    this.radius = radius
    this.color = color
    this.mass = Math.pow(radius, 2)
    this.preasureForce = 0
    this.angleOnCollision = null

    this.update = function () {
      // Aplicar gravedad en todas las situaciones
      this.dy += gravity

      // Aplicar fricción para que las partículas eventualmente se detengan
      this.dx *= friction
      this.dy *= friction

      // Actualizar las posiciones
      this.x += this.dx
      this.y += this.dy

      // Rebotar en los bordes
      this.checkCollisionWithWalls()
      this.checkCollisionWithGround()
      this.checkCollisionWithRoof()

      for (const otherBall of ballArray) {
        if (otherBall !== this) {
          this.checkCollision(otherBall)
        }
      }

      this.draw()
    }

    this.checkCollisionWithGround = function () {
      if (this.y + this.radius > canvasHeight) {
        this.y = canvasHeight - this.radius
        this.dy = -this.dy * friction
        this.dx = this.dx * friction
      }
    }

    this.checkCollisionWithWalls = function () {
      if (this.x + this.radius > canvasWidth) {
        this.x = canvasWidth - this.radius
        this.dx = -this.dx * friction
      }
      if (this.x - this.radius < 0) {
        this.x = this.radius
        this.dx = -this.dx * friction
      }
    }

    this.checkCollisionWithRoof = function () {
      const roofHeight = 0

      if (this.y - this.radius < roofHeight) {
        this.y = roofHeight + this.radius
        this.dy = -this.dy * friction
        this.dx = this.dx * friction
      }
    }

    this.checkCollision = function (otherBall) {
      const dx = otherBall.x - this.x
      const dy = otherBall.y - this.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      const minDistance = this.radius + otherBall.radius + collisionMargin

      if (distance < minDistance) {
        const angle = Math.atan2(dy, dx)
        const overlap = minDistance - distance

        // Calcular las nuevas posiciones después de la colisión
        const moveX = (overlap / 2) * Math.cos(angle)
        const moveY = (overlap / 2) * Math.sin(angle)

        this.x -= moveX
        this.y -= moveY
        otherBall.x += moveX
        otherBall.y += moveY

        // Calcular las velocidades relativas
        const relativeVelocityX = otherBall.dx - this.dx
        const relativeVelocityY = otherBall.dy - this.dy

        // Calcular la velocidad relativa en la dirección normal
        const normalRelativeVelocity = relativeVelocityX * Math.cos(angle) + relativeVelocityY * Math.sin(angle)

        // Verificar si las bolas se están acercando
        if (normalRelativeVelocity < 0) {
          // Calcular la impulsión utilizando la conservación de la cantidad de movimiento
          const impulse = (2 * normalRelativeVelocity) / (this.mass + otherBall.mass)
          // Calcular la fuerza de colisión
          const preasureForce = -normalRelativeVelocity * (this.mass + otherBall.mass)
          // Almacenar la fuerza de colisión en el atributo de la bola
          this.preasureForce += preasureForce
          // Establecer que ha habido una colisión
          this.angleOnCollision = Math.atan2(dy, dx)

          // Aplicar la impulsión a las velocidades
          this.dx += impulse * otherBall.mass * Math.cos(angle)
          this.dy += impulse * otherBall.mass * Math.sin(angle)
          otherBall.dx -= impulse * this.mass * Math.cos(angle)
          otherBall.dy -= impulse * this.mass * Math.sin(angle)
        }
      }
    }

    this.updateColorByVelocity = function () {
      const speed = Math.sqrt(this.dx ** 2 + this.dy ** 2)
      const maxSpeed = 10

      // Calcular la intensidad del color basada en la velocidad
      const intensity = Math.min(speed / maxSpeed, 1)

      // Calcular el componente verde (mientras más rápido, más verde)
      const green = 255 * (1 - intensity)

      // Calcular el componente rojo (mientras más rápido, más rojo)
      const red = 255 * intensity

      // Asignar el nuevo color basado en la intensidad
      this.color = `rgb(${red}, ${green}, 0)`
    }

    this.updateColorByPresure = function () {
      const maxForce = 50000
      const intensity = Math.min(this.preasureForce / maxForce, 1)

      const green = 255 * (1 - intensity)
      const red = 255 * intensity

      this.color = `rgb(${red}, ${green}, 0)`
    }
    this.updateColorByCollision = function () {
      const collisionColor = '#F44336'
      const noCollisionColor = '#C8E6C9'
      const transitionSpeed = 0.02

      if (this.angleOnCollision !== null) {
        // Cambiar gradualmente hacia el color de colisión
        this.color = interpolateColor(this.color, collisionColor, transitionSpeed)

        // Restablecer el ángulo después de actualizar el color
        this.angleOnCollision = null
      } else {
        // Cambiar gradualmente hacia el color sin colisión
        this.color = interpolateColor(this.color, noCollisionColor, transitionSpeed)
      }
    }

    this.draw = function () {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
      ctx.fillStyle = this.color
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
    }
  }
}

let ballArray = []

function init () {
  ballArray = []

  for (let i = 0; i < ballCount; i++) {
    const radius = ballSize
    const x = randomIntFromRange(radius, canvas.width - radius)
    const y = randomIntFromRange(0, canvas.height - radius)
    const dx = randomIntFromRange(-3, 3)
    const dy = randomIntFromRange(-2, 2)
    ballArray.push(new Ball(x, y, dx, dy, radius, randomColor(colors)))
  }
}

function animate () {
  // Actualizar el tamaño del lienzo si ha cambiado
  if (canvasWidth !== window.innerWidth || canvasHeight !== window.innerHeight) {
    updateCanvasSize()
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const ball of ballArray) {
    ball.update()
    ball.updateColorByCollision()
  }

  handleWindowMove()
  // Ball.limitBallsToCircle(ballArray)
  window.requestAnimationFrame(animate)
}

Ball.limitBallsToCircle = function (balls) {
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const maxRadius = canvasRadius

  for (const ball of balls) {
    const distance = Math.sqrt((ball.x - centerX) ** 2 + (ball.y - centerY) ** 2)

    if (distance + ball.radius > maxRadius) {
      // Calcular el ángulo y la posición en el límite del círculo
      const angle = Math.atan2(ball.y - centerY, ball.x - centerX)
      ball.x = centerX + (maxRadius - ball.radius) * Math.cos(angle)
      ball.y = centerY + (maxRadius - ball.radius) * Math.sin(angle)
    }
  }
}

init()
animate()
