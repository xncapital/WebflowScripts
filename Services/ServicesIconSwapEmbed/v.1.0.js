
$(function () {
    setTimeout(() => {
             $('.services--tab--img--dark').hide()
             $('.services--tab--img--gray').show()
             $('.w--current').find('.services--tab--img--dark').show()
             $('.w--current').find('.services--tab--img--gray').hide()
         }, 200);
     $('.services--timeline--button').on('click', ()=>{
         setTimeout(() => {
             $('.services--tab--img--dark').hide()
             $('.services--tab--img--gray').show()
             $('.w--current').find('.services--tab--img--dark').show()
             $('.w--current').find('.services--tab--img--gray').hide()
         }, 200);
 
     })
 });
 