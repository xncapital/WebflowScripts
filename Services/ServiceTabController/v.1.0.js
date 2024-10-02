
$(document).ready(function () {
    function checkAndTriggerClick() {
        setTimeout(() => {


            if ($(window).width() < 992) {

                if ($('.services--timeline--button').eq(0).hasClass('w--current')){
                    console.log('lol')
                    $('.services--timeline--button').eq(3).trigger(`click`)
                } else if ($('.services--timeline--button').eq(1).hasClass('w--current')) return;
                else if ($('.services--timeline--button').eq(2).hasClass('w--current')) $('.services--timeline--button').eq(3).trigger(`click`)


            } else {
                if ($('.services--timeline--button').eq(0).hasClass('w--current')) return;
                else if ($('.services--timeline--button').eq(1).hasClass('w--current')) return;
                else if ($('.services--timeline--button').eq(2).hasClass('w--current')) return;
                else if ($('.services--timeline--button').eq(3).hasClass('w--current')) $('.services--timeline--button').eq(2).trigger(`click`)

            }
        }, 500);
    }

    checkAndTriggerClick();

    $(window).resize(checkAndTriggerClick);
});
