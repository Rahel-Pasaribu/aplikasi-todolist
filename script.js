// Global variables
let magicNumber = Math.floor(Math.random() * 100) + 1
let attempts = 0
let gameStats = {
  gamesPlayed: Number.parseInt(localStorage.getItem("gamesPlayed")) || 0,
  gamesWon: Number.parseInt(localStorage.getItem("gamesWon")) || 0,
  totalAttempts: Number.parseInt(localStorage.getItem("totalAttempts")) || 0,
  bestScore: Number.parseInt(localStorage.getItem("bestScore")) || null,
}
let todos = JSON.parse(localStorage.getItem("todos")) || []
let currentFilter = "all"

// ===== MAGIC NUMBER GAME =====
function makeGuess() {
  const guessInput = document.getElementById("guessInput")
  const guess = Number.parseInt(guessInput.value)
  const feedbackDiv = document.getElementById("gameFeedback")
  const attemptsDiv = document.getElementById("attemptsCount")

  if (isNaN(guess) || guess < 1 || guess > 100) {
    feedbackDiv.innerHTML = '<div class="game-feedback feedback-high">Masukkan angka yang valid antara 1-100!</div>'
    return
  }

  attempts++
  attemptsDiv.innerHTML = `Percobaan ke-${attempts}`

  if (guess === magicNumber) {
    feedbackDiv.innerHTML = `<div class="game-feedback feedback-correct">
            🎉 Selamat! Anda berhasil menebak angka ${magicNumber} dalam ${attempts} percobaan!
        </div>`

    // Update statistics
    gameStats.gamesPlayed++
    gameStats.gamesWon++
    gameStats.totalAttempts += attempts

    if (gameStats.bestScore === null || attempts < gameStats.bestScore) {
      gameStats.bestScore = attempts
    }

    saveGameStats()
    updateStatsDisplay()

    guessInput.disabled = true
  } else if (guess > magicNumber) {
    feedbackDiv.innerHTML =
      '<div class="game-feedback feedback-high">Tebakan Anda terlalu tinggi! Coba angka yang lebih kecil.</div>'
  } else {
    feedbackDiv.innerHTML =
      '<div class="game-feedback feedback-low">Tebakan Anda terlalu rendah! Coba angka yang lebih besar.</div>'
  }

  guessInput.value = ""
  guessInput.focus()
}

function resetGame() {
  magicNumber = Math.floor(Math.random() * 100) + 1
  attempts = 0

  document.getElementById("guessInput").disabled = false
  document.getElementById("guessInput").value = ""
  document.getElementById("gameFeedback").innerHTML = ""
  document.getElementById("attemptsCount").innerHTML = ""

  console.log("New magic number:", magicNumber) // For debugging
}

function saveGameStats() {
  localStorage.setItem("gamesPlayed", gameStats.gamesPlayed)
  localStorage.setItem("gamesWon", gameStats.gamesWon)
  localStorage.setItem("totalAttempts", gameStats.totalAttempts)
  localStorage.setItem("bestScore", gameStats.bestScore)
}

function updateStatsDisplay() {
  document.getElementById("gamesPlayed").textContent = gameStats.gamesPlayed
  document.getElementById("gamesWon").textContent = gameStats.gamesWon

  const averageAttempts = gameStats.gamesWon > 0 ? (gameStats.totalAttempts / gameStats.gamesWon).toFixed(1) : 0
  document.getElementById("averageAttempts").textContent = averageAttempts

  document.getElementById("bestScore").textContent = gameStats.bestScore || "-"
}

// ===== PASSWORD CHECKER =====
function checkPassword() {
  const password = document.getElementById("passwordInput").value
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  }

  // Update requirement indicators
  updateRequirement("lengthReq", requirements.length)
  updateRequirement("uppercaseReq", requirements.uppercase)
  updateRequirement("lowercaseReq", requirements.lowercase)
  updateRequirement("numberReq", requirements.number)
  updateRequirement("specialReq", requirements.special)

  // Calculate strength
  const score = Object.values(requirements).filter(Boolean).length
  updatePasswordStrength(score, password.length)
}

function updateRequirement(elementId, isValid) {
  const element = document.getElementById(elementId)
  const icon = element.querySelector("i")

  if (isValid) {
    element.className = "requirement valid"
    icon.className = "bi bi-check-circle"
  } else {
    element.className = "requirement invalid"
    icon.className = "bi bi-x-circle"
  }
}

function updatePasswordStrength(score, length) {
  const strengthBar = document.getElementById("strengthBar")
  const strengthText = document.getElementById("strengthText")
  const strengthScore = document.getElementById("strengthScore")

  const percentage = (score / 5) * 100
  strengthBar.style.width = percentage + "%"
  strengthScore.textContent = `${score}/5`

  let strengthLevel = ""
  let barColor = ""

  if (score === 0) {
    strengthLevel = "Belum ada password"
    barColor = "bg-secondary"
  } else if (score <= 2) {
    strengthLevel = "Lemah"
    barColor = "bg-danger"
  } else if (score <= 3) {
    strengthLevel = "Sedang"
    barColor = "bg-warning"
  } else if (score <= 4) {
    strengthLevel = "Kuat"
    barColor = "bg-info"
  } else {
    strengthLevel = length >= 12 ? "Sangat Kuat" : "Kuat"
    barColor = "bg-success"
  }

  strengthText.textContent = strengthLevel
  strengthBar.className = `progress-bar ${barColor}`
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById("passwordInput")
  const toggleIcon = document.getElementById("passwordToggleIcon")

  if (passwordInput.type === "password") {
    passwordInput.type = "text"
    toggleIcon.className = "bi bi-eye-slash"
  } else {
    passwordInput.type = "password"
    toggleIcon.className = "bi bi-eye"
  }
}

// ===== TODO LIST =====
function addTodo() {
  const todoInput = document.getElementById("todoInput")
  const todoText = todoInput.value.trim()

  if (todoText === "") {
    alert("Masukkan tugas yang valid!")
    return
  }

  const newTodo = {
    id: Date.now(),
    text: todoText,
    completed: false,
    createdAt: new Date().toISOString(),
  }

  todos.unshift(newTodo) // Add to beginning of array
  todoInput.value = ""

  saveTodos()
  renderTodos()
  updateTodoStats()
}

function deleteTodo(id) {
  if (confirm("Yakin ingin menghapus tugas ini?")) {
    todos = todos.filter((todo) => todo.id !== id)
    saveTodos()
    renderTodos()
    updateTodoStats()
  }
}

function toggleTodo(id) {
  const todo = todos.find((todo) => todo.id === id)
  if (todo) {
    todo.completed = !todo.completed
    saveTodos()
    renderTodos()
    updateTodoStats()
  }
}

function editTodo(id) {
  const todo = todos.find((todo) => todo.id === id)
  if (todo) {
    const newText = prompt("Edit tugas:", todo.text)
    if (newText !== null && newText.trim() !== "") {
      todo.text = newText.trim()
      saveTodos()
      renderTodos()
    }
  }
}

function renderTodos() {
  const container = document.getElementById("todoContainer")
  let filteredTodos = todos

  // Apply filter
  if (currentFilter === "completed") {
    filteredTodos = todos.filter((todo) => todo.completed)
  } else if (currentFilter === "pending") {
    filteredTodos = todos.filter((todo) => !todo.completed)
  }

  if (filteredTodos.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-list-check"></i>
                <h5>Tidak ada tugas</h5>
                <p class="text-muted">
                    ${
                      currentFilter === "all"
                        ? "Tambahkan tugas pertama Anda!"
                        : currentFilter === "completed"
                          ? "Belum ada tugas yang selesai."
                          : "Semua tugas sudah selesai!"
                    }
                </p>
            </div>
        `
    return
  }

  container.innerHTML = filteredTodos
    .map(
      (todo) => `
        <div class="todo-item ${todo.completed ? "completed" : ""}">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" ${todo.completed ? "checked" : ""} 
                       onchange="toggleTodo(${todo.id})">
            </div>
            <div class="todo-text">${escapeHtml(todo.text)}</div>
            <div class="todo-actions">
                <button class="btn btn-outline-primary btn-sm" onclick="editTodo(${todo.id})" 
                        ${todo.completed ? "disabled" : ""}>
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteTodo(${todo.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

function filterTodos(filter) {
  currentFilter = filter

  // Update button states
  document.querySelectorAll(".btn-outline-secondary, .btn-outline-success, .btn-outline-warning").forEach((btn) => {
    btn.classList.remove("active")
  })

  renderTodos()
}

function clearAllTodos() {
  if (todos.length === 0) {
    alert("Tidak ada tugas untuk dihapus!")
    return
  }

  if (confirm("Yakin ingin menghapus semua tugas?")) {
    todos = []
    saveTodos()
    renderTodos()
    updateTodoStats()
  }
}

function updateTodoStats() {
  const total = todos.length
  const completed = todos.filter((todo) => todo.completed).length
  const pending = total - completed

  document.getElementById("totalTodos").textContent = total
  document.getElementById("completedTodos").textContent = completed
  document.getElementById("pendingTodos").textContent = pending
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos))
}

function handleTodoKeyPress(event) {
  if (event.key === "Enter") {
    addTodo()
  }
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Magic Number stats
  updateStatsDisplay()

  // Initialize Todo List
  renderTodos()
  updateTodoStats()

  // Focus on guess input when Magic Number tab is active
  document.getElementById("magic-number-tab").addEventListener("shown.bs.tab", () => {
    document.getElementById("guessInput").focus()
  })

  // Focus on password input when Password Checker tab is active
  document.getElementById("password-checker-tab").addEventListener("shown.bs.tab", () => {
    document.getElementById("passwordInput").focus()
  })

  // Focus on todo input when Todo List tab is active
  document.getElementById("todo-list-tab").addEventListener("shown.bs.tab", () => {
    document.getElementById("todoInput").focus()
  })

  // Handle Enter key for guess input
  document.getElementById("guessInput").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      makeGuess()
    }
  })

  // Handle Enter key for todo input
  document.getElementById("todoInput").addEventListener("keypress", handleTodoKeyPress)

  console.log("🚀 JavaScript Praktikum loaded successfully!")
  console.log("📚 Available functions:")
  console.log("- Magic Number: makeGuess(), resetGame()")
  console.log("- Password Checker: checkPassword(), togglePasswordVisibility()")
  console.log("- Todo List: addTodo(), deleteTodo(), toggleTodo(), editTodo(), filterTodos(), clearAllTodos()")
  console.log("Current magic number:", magicNumber) // For debugging
})

// Debug functions
window.debugFunctions = {
  resetGameStats: () => {
    localStorage.removeItem("gamesPlayed")
    localStorage.removeItem("gamesWon")
    localStorage.removeItem("totalAttempts")
    localStorage.removeItem("bestScore")
    gameStats = { gamesPlayed: 0, gamesWon: 0, totalAttempts: 0, bestScore: null }
    updateStatsDisplay()
    console.log("Game stats reset!")
  },
  showMagicNumber: () => {
    console.log("Current magic number:", magicNumber)
  },
  clearAllData: () => {
    localStorage.clear()
    location.reload()
  },
}
