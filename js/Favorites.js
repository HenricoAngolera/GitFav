import { GithubUser } from './GithubUser.js'

// classe que vai conter toda a lógica dos dados
// como os dados serão estruturados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)
      console.log(userExists)

      if (userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GithubUser.search(username)
      console.log(user)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado')
      }
      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (e) {
      alert(e.message)
    }
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    )

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

// classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)
    // super vai chamar o construtor da Favorites

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onAdd()
    this.emptyFavorites()
  }

  onAdd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')
      // vamos desestruturar o  valor de dentro do input, se não apenas pegamos o input.

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja apagar este usuário?') // Uma espécie de alert, mas serve para confimar alguma coisa. Retorna true ou false
        if (isOk) {
          this.delete(user)
          this.emptyFavorites()
        }
      }
      this.tbody.append(row)
    }) // forEach = para cada um
  }

  createRow() {
    const tr = document.createElement('tr') // cria uma tr pela DOM

    tr.innerHTML = `
      <td class="user">
        <img
          src="https://github.com/HenricoAngolera.png"
          alt="Imagem de Henrico Angolera"
        />
        <a href="https://github.com/HenricoAngolera" target="_blank">
          <p>Henrico Angolera</p>
          <span>HenricoAngolera</span>
        </a>
      </td>
      <td class="repositories">13</td>
      <td class="followers">3</td>
      <td>
        <button type="button" class="remove">Remover</button>
      </td>
    `
    return tr
  }

  removeAllTr() {
    this.tbody
      .querySelectorAll('tr') // selecionar todos os <tr>, retorna um NodeList de <tr>
      .forEach(tr => {
        tr.remove()
      }) /* forEach = para cada um */
  }

  emptyFavorites() {
    const trEmptyUsers = this.createEmptyFavorites()

    const emptyFavoritesUsers = this.entries.length === 0

    if (emptyFavoritesUsers) {
      trEmptyUsers.classList.remove('hide')
      console.log('ta vazio')
      this.tbody.append(trEmptyUsers)
    } else {
      trEmptyUsers.classList.add('hide')
      console.log('tem algum usuário')
    }
  }

  createEmptyFavorites() {
    const trEmpty = document.createElement('tr')

    trEmpty.innerHTML = `
      <td colspan="4">
        <div class="empty-favorite">
          <img src="./assets/Estrela.png" alt="estrela cinza com rosto fazendo expressão surpreza">
          <p>Nenhum favorito ainda</p>
        </div>
      </td>
    `

    return trEmpty
  }
}
