// FRONT-END (CLIENT) JAVASCRIPT HERE

let editId = null

const displayBooks = function( data ) {
  const readingList = document.querySelector( '#readingList' )

  readingList.innerHTML = ''

  data.forEach( function( book, index ) {
    readingList.innerHTML += 
    `<tr>
    <td>${book.book}</td>
    <td>${book.author}</td>
    <td>${book.pagesRead}</td>
    <td>${book.totalPages}</td>
    <td>${book.percentComplete}%</td>
    <td>
    <button class="editButton" data-id="${book._id}" data-index="${index}">Edit</button>
    <button class="deleteButton" data-id="${book._id}">Delete</button>
    </td>
    </tr>`
  })

  const editButtons = document.querySelectorAll( '.editButton' )

  editButtons.forEach( function( button ) {
    button.onclick = function() {
      const index = button.getAttribute( 'data-index' )
      const id = button.getAttribute( 'data-id' )
      editBook( index, id, data )
    }
  })

  const deleteButtons = document.querySelectorAll( '.deleteButton' )
  deleteButtons.forEach( function( button ) {
    button.onclick = function() {
        const id = button.getAttribute( 'data-id' )
        deleteBook( id )
    }
  })
}

const editBook = function( index, id, data ) {
  editId = id

  document.querySelector( '#book' ).value = data[index].book
  document.querySelector( '#author' ).value = data[index].author
  document.querySelector( '#pagesRead' ).value = data[index].pagesRead
  document.querySelector( '#totalPages' ).value = data[index].totalPages
}

const deleteBook = async function( id ) {
    const json = { _id: id }, 
    body = JSON.stringify( json )
  
  const response = await fetch( '/delete', {
    method:'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  })
  
  await response.json()
  
  loadBooks()
}

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const book = document.querySelector( '#book' ),
        author = document.querySelector( '#author' ),
        pagesRead = document.querySelector( '#pagesRead' ),
        totalPages = document.querySelector( '#totalPages' ),

        json = { book: book.value, author: author.value, pagesRead: pagesRead.value, totalPages: totalPages.value, _id: editId },
        body = JSON.stringify( json )

    let route = '/submit'

    if ( editId ) {
      route = '/update'
    }

  const response = await fetch( route, {
    method:'POST',
    headers: { 'Content-Type': 'application/json' },
    body 
  })

  await response.json()

  editId = null
  loadBooks()
}

const loadBooks = async function() {
  const response = await fetch( '/data' )
  const text = await response.text()

  console.log( 'data:', text )

  const data = JSON.parse( text )
  displayBooks( data )
}

window.onload = function() {
  const button = document.querySelector('button')
  button.onclick = submit

  loadBooks()
}