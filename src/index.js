console.log('New Page!!!')

const quoteUL = document.querySelector('#quote-list')
const quoteForm = document.querySelector('#new-quote-form')


const containerCenter = document.querySelector('.container')

const sortBtn = document.createElement('button')
sortBtn.className = 'btn btn-primary'
sortBtn.innerText = 'Sort: OFF'
sortBtn.addEventListener('click', evt => {
    if (sortBtn.innerText === 'Sort: OFF'){
        sortBtn.innerText = 'Sort: ON'
        removeChildren(quoteUL)
        sortedQuotes()
    }
    else {
        sortBtn.innerText = 'Sort: OFF'
        removeChildren(quoteUL)
        loadQuotes()
    }
})

containerCenter.prepend(sortBtn)

loadQuotes()

quoteForm.addEventListener('submit', evt => {
    evt.preventDefault()
    
    let newQuote = evt.target["new-quote"].value
    let quoteAuthor = evt.target.author.value
    
    fetch('http://localhost:3000/quotes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            quote: newQuote,
            author: quoteAuthor
        })
    })
    .then(resp => resp.json())
    .then(createQuote)
})

function removeChildren(parentNode) {  
    while (parentNode.firstChild) { 
        parentNode.removeChild(parentNode.firstChild)  
    }
}

function sortedQuotes(){
    fetch('http://localhost:3000/quotes?_sort=author&_embed=likes')
    .then(resp => resp.json())
    .then(respJSON => {
        respJSON.forEach(createQuote)
    })
}

function loadQuotes(){
    fetch('http://localhost:3000/quotes?_embed=likes')
    .then(resp => resp.json())
    .then(respJSON => respJSON.forEach(createQuote))
}

function createQuote(obj){
    const quoteLi = document.createElement('li')
        quoteLi.className = 'quote-card'
    
    const block = document.createElement('blockquote')
        block.className = 'blockquote'
    
    const p = document.createElement('p')
        p.className = 'mb-0'
        p.innerText = obj.quote
    
    const footer = document.createElement('footer')
        footer.className = 'blockquote-footer'
        footer.innerText = obj.author
    
    const br = document.createElement('br')
    
    const likeBtn = document.createElement('button')
        likeBtn.className = 'btn-success'
        likeBtn.innerText = 'Likes: '
    
        const span = document.createElement('span')
            obj.likes ? span.innerText = obj.likes.length : span.innerText = 0
            likeBtn.append(span)
            likeBtn.addEventListener('click', evt => {
                evt.preventDefault()
                likeQuote(obj, likeBtn)
            })
                
    const deleteBtn = document.createElement('button')
        deleteBtn.className = 'btn-danger'
        deleteBtn.innerText = 'Delete'
        deleteBtn.addEventListener('click', evt => {
            evt.preventDefault()
            deleteQuote(obj)
        })
                
    const editForm = document.createElement('form')
        editForm.id = 'hidden-edit'
        
        const formGroup = document.createElement('div')
        formGroup.className = 'form-group'
        
        const quoteLabel = document.createElement('label')
        quoteLabel.innerHTML = `<label for="edit-quote">Edit Quote</label>`
        
        const quoteEdit = document.createElement('input')
        quoteEdit.innerHTML = `<input type="text" class="form-control" placeholder="">`
        quoteEdit.id = 'edit-quote'
        
        formGroup.append(quoteLabel, quoteEdit)
        
        const submitEdit = document.createElement('button')
        submitEdit.innerHTML = `<button type="submit" class="btn btn-primary">Submit Edit</button>`
                
    editForm.append(formGroup, submitEdit)
    editForm.addEventListener('submit', evt => {
        evt.preventDefault()
        editQuote(obj, evt)
    })

    const editBtn = document.createElement('button')
        editBtn.className = 'btn-caution'
        editBtn.innerText = 'Edit Quote'

        
        editBtn.addEventListener('click', evt => {
            evt.preventDefault()
            
            if (editBtn.innerText === 'Edit Quote'){
                block.append(editForm)
                editBtn.innerText = 'Close Edit'
            }
            else {
                editForm.parentNode.removeChild(editForm)
                editBtn.innerText = 'Edit Quote'
            }
        })

        block.append(p, footer, br, likeBtn, deleteBtn, editBtn)

    quoteLi.append(block)

    quoteUL.append(quoteLi)
}

function deleteQuote(obj){
    fetch(`http://localhost:3000/quotes/${obj.id}`, {
        method: 'DELETE'
    })
    .then(resp => resp.json())
    .then(respJSON => {
        removeChildren(quoteUL)
        loadQuotes()
    })
}

function likeQuote(obj, button){
    //Optimistic Rendering
    button.firstElementChild.innerText = (parseInt(button.firstElementChild.innerText) + 1).toString()
    let unixTime = Math.round((new Date()).getTime() / 1000)
    fetch('http://localhost:3000/likes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            quoteId: parseInt(obj.id),
            createdAt: unixTime
        })
    })
    // .then(resp => resp.json())
    // .then(respJSON => {
    //     fetch(`http://localhost:3000/quotes/${obj.id}?_embed=likes`)
    //     .then(resp => resp.json())
    //     .then(respJSON => {
    //         button.firstElementChild.innerText = respJSON.likes.length
    //     })
    // })
}

function editQuote(obj, evt){
    console.log(obj)
    let newQuote = evt.target["edit-quote"].value
    if (newQuote === "") {return}
    
    fetch(`http://localhost:3000/quotes/${obj.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            quote: newQuote
        })
    })
    .then(resp => resp.json())
    .then(respJSON => {
        removeChildren(quoteUL)
        loadQuotes()
    })
}