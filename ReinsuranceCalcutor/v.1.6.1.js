$(function () {

    // global variables
    let lossItem = $('.reinsurance--loss--row').eq(0);
    let dragging = false;
    let summaryRb = $('.reinsurance--summary--card.remaining-balance')
    let summaryRbIcon = $('.dashboard--info--icon.remaining-balance')
    let summaryXol = $('.reinsurance--summary--card.xol-payout')
    let summaryAgg = $('.reinsurance--summary--card.agg-payout')
    let summaryQuota = $('.reinsurance--summary--card.quota-payout')
    let cardBalance = $('.reinsurance--summary--card--value').eq(0)
    let cardXolPayout = $('.reinsurance--summary--card--value').eq(1)
    let cardAggPayout = $('.reinsurance--summary--card--value').eq(2)
    let cardQuotaPayout = $('.reinsurance--summary--card--value').eq(3)
    let labelDecoration_purple = 'https://cdn.prod.website-files.com/64cbd86665037e2f4e4e8779/672c90a69adabb3768b071e9_Beak--left--purple.svg'
    let labelDecoration_blue = 'https://cdn.prod.website-files.com/64cbd86665037e2f4e4e8779/6729fd438407bf8b69598833_Beak--left--blue.svg'

    let cardStyles = [];

    $('.reinsurance--summary--card').each(function (index, element) {
        const card = $(element);

        const backgroundColor = card.css('background-color');
        const headingColor = card.find('.reinsurance--summary--card--heading').css('color');
        const valueColor = card.find('.reinsurance--summary--card--value').css('color');
        cardStyles.push({
            cardIndex: 'card-${index}',
            backgroundColor: backgroundColor,
            headingColor: headingColor,
            valueColor: valueColor
        });
    });





    // controllers
    const controller = {
        inputCard(target) {
            let row = target.find('.reinsurance--rows');
            let icon = target.find('.reinsurance--sliders--accordion--button');

            if (row.css('display') === 'none') {
                // close open card
                if ($('.reinsurance--slider--card.active').length > 0) {
                    let previousActive = $('.reinsurance--slider--card.active');
                    let previousRow = previousActive.find('.reinsurance--rows');
                    let previousIcon = previousActive.find('.reinsurance--sliders--accordion--button');
                    previousIcon.removeClass('active');
                    previousRow.hide();
                    previousRow.css('height', '0px');
                    previousRow.css('opacity', '0%');
                }
                target.addClass('active');
                row.show();
                row.css('height', 'auto');
                row.css('opacity', '100%');
                icon.addClass('active');
            } else {
                target.removeClass('active');
                icon.removeClass('active');
                row.hide();
                row.css('height', '0px');
                row.css('opacity', '0%');
            }
        },
        addLoss() {
            let newLoss = lossItem.clone();
            newLoss.find('.reinsurance--input').val('$0');
            newLoss.insertBefore('.reinsurance--add--row');
            controller.formatDollarInput(newLoss.find('.reinsurance--input'));
        },
        calculateLoss() {
            let totalLoss = 0;

            // Loop through each .reinsurance--input to sum the values
            $('.reinsurance--slider--card.loss').find('.reinsurance--input').each(function () {
                let value = $(this).val().replace(/[^0-9.]/g, ''); // Get the numeric value
                if (value) {
                    totalLoss += parseFloat(value); // Add to total loss
                }
            });

            // Format the total loss with commas and update the #value--total-loss
            let formattedTotalLoss = '$' + totalLoss.toLocaleString('en-US', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 0,
                useGrouping: true
            });

            $('#value--total-loss').text(formattedTotalLoss); // Update the total loss field
        },
        formatDollarInput($input) {
            $input.on('input', function (e) {
                let inputElem = $(e.target);
                let cursorPos = inputElem[0].selectionStart;
                let value = inputElem.val().replace(/[^0-9.]/g, '');
                let beforeCursor = inputElem.val().substr(0, cursorPos);
                let nonNumericBeforeCursor = beforeCursor.replace(/[0-9.]/g, '').length;

                if (value) {
                    let formattedValue = parseFloat(value).toLocaleString('en-US', {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 0,
                        useGrouping: true
                    });
                    inputElem.val('$' + formattedValue);
                } else {
                    inputElem.val('$');
                }

                let afterCursor = inputElem.val().substr(0, cursorPos + 1);
                let nonNumericAfterCursor = afterCursor.replace(/[0-9.]/g, '').length;
                cursorPos += (nonNumericAfterCursor - nonNumericBeforeCursor);
                inputElem[0].setSelectionRange(cursorPos, cursorPos);

                // Calculate the total loss each time an input is changed
                controller.calculateLoss();
            });
        },
        adjustSliderAndInputs(responsibilityPercentage) {
            let reinsurer_percentage = 100 - responsibilityPercentage;
            $('#quota-share--responsibility').val(responsibilityPercentage + '%');
            $('#quota-share--reinsurer').val(reinsurer_percentage + '%');

            // Adjust the slider's progress bar width
            $('.reinsurance-slider--progress').css('width', responsibilityPercentage + '%');
        }
    };


    /* HELPERS */

    function parseToNumber(inputString) {
        // Remove anything that's not a number or decimal point, and convert to a float
        let cleanedString = inputString.replace(/[^0-9.]/g, '');
        let parsedValue = parseFloat(cleanedString) || 0;

        // If the original string contained a percentage, divide by 100 to convert to a decimal
        if (inputString.includes('%')) {
            parsedValue = parsedValue / 100;
        }

        return parsedValue;
    }
    function formatToPercentage(number) {
        // Multiply by 100 to convert the decimal to a percentage
        let percentageValue = number * 100;

        // Format the number to a maximum of 2 decimal places
        return percentageValue.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }) + '%';
    }


    function formatToDollar(number) {
        return '$' + number.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }



    //handlers


    /* FILTER HANDLER */

    const handleFilters = () => {
        const isXolActive = $('#xol').hasClass('active');
        const isAggActive = $('#agg').hasClass('active');
        const isQuotaActive = $('#quota').hasClass('active');

        $('#max-limit--input--label').text('XoL Max Limit')
        $('#input--max-limit').show()
        $('#input--attachment-point').show()
        $('.reinsurance--summary--card.xol-payout').css('display', 'flex');
        if (!isXolActive && !isAggActive && !isQuotaActive) {
            cardStyle($('#card-0'), false)
            cardStyle($('#card-1'), false)
            cardStyle($('#card-2'), false)
            cardStyle($('#card-3'), false)
            $('#input--agg-point').hide();
            $('#input--quota-share').hide();
        } else if (!isXolActive && isAggActive && !isQuotaActive) { // only Agg
            cardStyle($('#card-0'), true)
            cardStyle($('#card-1'), false)
            cardStyle($('#card-2'), true)
            cardStyle($('#card-3'), false)
            $('#input--quota-share').hide();
            $('#input--max-limit').hide();
            $('#input--attachment-point').hide();
            $('.reinsurance--summary--card.quota-payout').hide();
            $('.reinsurance--summary--card.agg-payout').css('display', 'flex');
            $('.reinsurance--summary--card.xol-payout').hide();
            $('#input--agg-point').show();

        } else if (!isXolActive && !isAggActive && isQuotaActive) { // only quota
            cardStyle($('#card-0'), true)
            cardStyle($('#card-1'), false)
            cardStyle($('#card-2'), false)
            cardStyle($('#card-3'), true)
            $('#input--agg-point').hide();
            $('#input--attachment-point').hide();
            $('.reinsurance--summary--card.agg-payout').hide();
            $('.reinsurance--summary--card.quota-payout').css('display', 'flex');
            $('#max-limit--input--label').text('Quota Max Limit')
            $('.reinsurance--summary--card.xol-payout').hide();
            $('#input--quota-share').show();
        } else if (isXolActive && !isAggActive && !isQuotaActive) {
            cardStyle($('#card-0'), true)
            cardStyle($('#card-1'), true)
            cardStyle($('#card-2'), false)
            cardStyle($('#card-3'), false)

            $('#input--agg-point').hide();
            $('#input--quota-share').hide();
            summaryAgg.hide();
            $('.reinsurance--summary--card.quota-payout').hide();
        } else if (isXolActive && isAggActive && !isQuotaActive) {
            cardStyle($('#card-0'), true)
            cardStyle($('#card-1'), true)
            cardStyle($('#card-2'), true)
            cardStyle($('#card-3'), false)

            $('#input--agg-point').show();
            $('#input--quota-share').hide();
            $('.reinsurance--summary--card.agg-payout').css('display', 'flex');
            $('.reinsurance--summary--card.quota-payout').hide();
        } else if (isXolActive && !isAggActive && isQuotaActive) {
            cardStyle($('#card-0'), true)
            cardStyle($('#card-1'), true)
            cardStyle($('#card-2'), false)
            cardStyle($('#card-3'), true)

            $('#input--agg-point').hide();
            $('#input--quota-share').show();
            $('.reinsurance--summary--card.agg-payout').hide();
            $('.reinsurance--summary--card.quota-payout').show();
        } else if (isXolActive && isAggActive && isQuotaActive) {
            cardStyle($('#card-0'), true)
            cardStyle($('#card-1'), true)
            cardStyle($('#card-2'), true)
            cardStyle($('#card-3'), true)

            $('#input--agg-point').show();
            $('#input--quota-share').show();
            $('.reinsurance--summary--card.agg-payout').css('display', 'flex');
            $('.reinsurance--summary--card.quota-payout').show();
        }
    };

    $('.reinsurance-type--checkbox').on('click', (e) => {
        let isAggActive = $('#agg').hasClass('active');
        let isQuotaActive = $('#quota').hasClass('active');

        let clicked = $(e.currentTarget)
        if (clicked.attr('id') === 'agg' && isQuotaActive) $('#quota').trigger('click');
        else if (clicked.attr('id') === 'quota' && isAggActive) $('#agg').trigger('click');

        if (clicked.hasClass('active')) clicked.removeClass('active')
        else clicked.addClass('active')



        handleFilters()
    });


    /* GRAPH RENDER START */

    // Save each reinsurance block as a template
    const baseBlockTemplate = $('.reinsurance--graph--block.base').clone();
    const xolBlockTemplate = $('.reinsurance--graph--block.xol').clone();
    const quotaBlockTemplate = $('.reinsurance--graph--block.quota').clone();
    const aggBlockTemplate = $('.reinsurance--graph--block.agg').clone();

    // Remove the original blocks from the DOM to avoid interference
    $('.reinsurance--graph--block.base').remove();
    $('.reinsurance--graph--block.xol').remove();
    $('.reinsurance--graph--block.quota').remove();
    $('.reinsurance--graph--block.agg').remove();


    const cardStyle = (card, active) => {
        const $card = $(card);
        const cardIndex = $card.index();
        const originalStyles = cardStyles[cardIndex];

        if (active) {
            // Reset to original styles
            $card.css('background-color', originalStyles.backgroundColor);
            $card.find('.reinsurance--summary--card--heading').css('color', originalStyles.headingColor);
            $card.find('.reinsurance--summary--card--value').css('color', originalStyles.valueColor);
        } else {
            // Apply inactive styles
            $card.css('background-color', '#F7F8F9');
            $card.find('.reinsurance--summary--card--heading').css('color', '#ADB3BD');
            $card.find('.reinsurance--summary--card--value').css('color', '#ADB3BD');
        }
    };

    const dotPosition = (dot, bottomOffset, leftOffset) => {
        const graph = $('.reinsurance--graph');
        const $dot = $(dot);

        // Ensure .reinsurance--graph is relative and #dot--max-limit is absolute
        graph.css('position', 'relative');
        $dot.css('position', 'absolute');

        // Get the dimensions of the graph area and the dot
        const graphHeight = graph.innerHeight();
        const graphWidth = graph.innerWidth();
        const dotHeight = $dot.outerHeight();
        const dotWidth = $dot.outerWidth();

        // Calculate position within the graph
        const topPosition = Math.max(graphHeight - bottomOffset - dotHeight, 0);
        const leftPosition = Math.max(Math.min(leftOffset, graphWidth - dotWidth), 0);

        // Set the dot position within .reinsurance--graph
        $dot.css({
            top: topPosition + 'px',
            left: leftPosition + 'px'
        });
    };


    function addReinsuranceBlock(template, bottomOffset, leftOffset) {
        // Clone the template
        const newBlock = template.clone();



        // Append the customized block to the .reinsurance--graph container
        $('.reinsurance--graph').append(newBlock);

        dotPosition(newBlock, bottomOffset, leftOffset)

        return newBlock;
    }


    function formatLargeNumber(parsedNumber) {
        var formattedValue = '';
        if (parsedNumber >= 1000 && parsedNumber < 1000000) {
            formattedValue = (parsedNumber / 1000).toFixed(1) + 'K';
        } else if (parsedNumber >= 1000000 && parsedNumber < 1000000000) {
            formattedValue = (parsedNumber / 1000000).toFixed(1) + 'M';
        } else {
            formattedValue = parsedNumber.toString();
        }

        // Ensure there is only one decimal place, remove if it's a '.0'
        formattedValue = formattedValue.replace(/\.0([KM])?$/, '$1');

        return '$' + formattedValue;
    }


    const renderGraph = (isXolActive, isAggActive, isQuotaActive, xol_max_limit, xol_ap, agg_ap, aggPayouts_array, insured_percentage, insurer_percentage) => {
        let maxHeight = $('.reinsurance--graph').height()
        let maxWidth = $('.reinsurance--graph').width()
        let usdPixelUnit_y = maxHeight / xol_max_limit
        let usdPixelUnit_x = maxWidth / xol_max_limit
        let dotMaxLimit = $('#dot--max-limit')
        let dotXolAp = $('#dot--ap')
        let dotAggAp = $('#dot--agg-ap')
        let text_MiddleRight = '.reinsurance--graph--dot.block--middle-right';
        let text_MiddleTop = '.reinsurance--graph--dot.block--middle-top';
        let defaultWidth = 84;
        let sideLabelAp = $('#side-label--ap')
        let sideLabelMax = $('#side-label--max')

        //conditional variables
        let aggLine = $('.reinsurance--agg-line')

        const linesStyle = (isActive, isAggLine) => {
            if (isActive) {
                dotMaxLimit.find('.reinsurance--dot--label--wrapper').css('width', `${maxWidth}px`)
                dotMaxLimit.find('.reinsurance--dot--label--wrapper').css('padding-left', `0px`)
                dotXolAp.find('.reinsurance--dot--label--wrapper').css('width', `${maxWidth}px`)
                dotXolAp.find('.reinsurance--dot--label--wrapper').css('padding-left', `0px`)
                dotXolAp.css('background-color', 'rgba(0,0,0,0)')
                dotXolAp.css('outline', 'none');
                dotMaxLimit.css('background-color', 'rgba(0,0,0,0)')
                dotMaxLimit.css('outline', 'none');
                dotXolAp.find('.reinsurance--dot--label--wrapper').css('left', '0px')
                dotMaxLimit.find('.reinsurance--dot--label--wrapper').css('left', '0px')
                dotXolAp.css('margin-left', '0px');
                dotMaxLimit.css('margin-left', '0px');
                dotXolAp.css('height', '9px');
                dotMaxLimit.css('height', '9px');
            } else { //basically the inital pre block state
                dotMaxLimit.find('.reinsurance--dot--label--wrapper').css('width', `auto`)
                dotMaxLimit.find('.reinsurance--dot--label--wrapper').css('padding-left', `32px`)
                dotXolAp.find('.reinsurance--dot--label--wrapper').css('width', `auto`)
                dotXolAp.find('.reinsurance--dot--label--wrapper').css('padding-left', `32px`)
                dotXolAp.css('background-color', '#4f5762')
                dotMaxLimit.css('background-color', '#4f5762')
                dotXolAp.css('outline', '8px solid rgba(79, 87, 98, 0.15)');
                dotMaxLimit.css('outline', '8px solid rgba(79, 87, 98, 0.15)');
                dotXolAp.find('.reinsurance--dot--label--wrapper').css('left', '14px')
                dotMaxLimit.find('.reinsurance--dot--label--wrapper').css('left', '14px')
                dotXolAp.css('margin-left', '-4.5px');
                dotMaxLimit.css('margin-left', '-4.5px');
                dotXolAp.css('height', '0px');
                dotMaxLimit.css('height', '0px');
                if ($('.reinsurance--graph--block.base').length === 0) {
                    dotXolAp.css('height', '9px');
                    dotMaxLimit.css('height', '9px');
                }
            }

            if (isAggLine) {
                dotAggAp.css('background-color', 'rgba(0,0,0,0)')
                dotAggAp.css('outline', 'none');
                if ($('.reinsurance--graph--block.base').length === 0) {
                    dotAggAp.css('background-color', '#4f5762')
                    dotAggAp.css('outline', '8px solid rgba(79, 87, 98, 0.15)');
                }
            }

        }


        const blockStyle = (options) => {

            const {
                index = 0,
                type = 'base',
                $newblock = null,
                currentLoss = 0,
                isLast = false,
                xol_limitReached = false,
                xol_max_limit = 0,
                aggPosition = 0,
                aggBlockWidth = 0,
                aggBlockIndex = 0,
                isAggLast = false,
                insured_percentage = 0,
                insurer_percentage = 0,
                quota_single = false
            } = options;


            let formattedLoss_total = formatLargeNumber(currentLoss);
            let formatted_xol_payout = ''
            let formatted_insured_loss = ''
            if (type === 'base') {
                if (!isLast && !xol_limitReached) {
                    $newblock.find(text_MiddleRight).remove();
                    $newblock.find(text_MiddleTop).find('.reinsurance--graph--text').text(formattedLoss_total);
                    $newblock.find(text_MiddleTop).css('left', `${(defaultWidth / 2) - 3.7}px`);
                    $newblock.css('height', `min(${usdPixelUnit_y * currentLoss}px, 100%)`);
                    if (isQuotaActive) $newblock.find(text_MiddleRight).css('top', `${(currentLoss / 2) * insured_percentage * usdPixelUnit_y}px`);
                    console.log('1');

                } else if (isLast && !xol_limitReached) {
                    $newblock.find(text_MiddleTop).remove();
                    $newblock.find(text_MiddleRight).find('.reinsurance--graph--text').text(formattedLoss_total);
                    $newblock.find(text_MiddleRight).css('top', `${(currentLoss / 2) * usdPixelUnit_y}px`);
                    if (isQuotaActive) $newblock.find(text_MiddleRight).css('top', `${(currentLoss / 2) * insured_percentage * usdPixelUnit_y}px`);
                    $newblock.css('height', `min(${usdPixelUnit_y * currentLoss}px, 100%)`);
                    console.log(currentLoss, insured_percentage, usdPixelUnit_y);
                } else if (!isLast && xol_limitReached) {
                    $newblock.find(text_MiddleRight).remove();
                    $newblock.find(text_MiddleTop).remove();
                    $newblock.css('height', `min(${usdPixelUnit_y * xol_ap}px, 100%)`);
                    $newblock.css('border-top-right-radius', `0px`);
                    $newblock.css('border-top-left-radius', `0px`);
                    if (isQuotaActive) $newblock.find(text_MiddleRight).css('top', `${(xol_ap / 2) * insured_percentage * usdPixelUnit_y}px`);
                    console.log('3');
                } else if (isLast && xol_limitReached) {
                    formatted_insured_loss = formatLargeNumber(xol_ap);
                    if (!isXolActive && !isAggActive && isQuotaActive) formatted_insured_loss = formatLargeNumber(currentLoss * insured_percentage);
                    if (!isXolActive && !isAggActive && isQuotaActive) console.log('in')
                    $newblock.find(text_MiddleTop).remove();
                    $newblock.find(text_MiddleRight).find('.reinsurance--graph--text').text(`+ ${formatted_insured_loss}`);
                    if (!isXolActive && !isAggActive && isQuotaActive) $newblock.find(text_MiddleRight).find('.reinsurance--graph--text').text(`+ ${formatted_insured_loss}`);
                    $newblock.find(text_MiddleRight).css('top', `${(xol_ap / 2) * usdPixelUnit_y}px`);
                    if (isQuotaActive) $newblock.find(text_MiddleRight).css('top', `${(xol_ap / 2) * insured_percentage * usdPixelUnit_y}px`);
                    $newblock.css('height', `${usdPixelUnit_y * xol_ap}px`);
                    $newblock.css('border-top-right-radius', `0px`);
                    $newblock.css('border-top-left-radius', `0px`);
                    console.log('4');
                }

            } else if (type === 'xol') {
                if (!isLast) {
                    $newblock.find(text_MiddleRight).remove();
                    $newblock.find(text_MiddleTop).find('.reinsurance--graph--text').text(formattedLoss_total);
                    $newblock.find(text_MiddleTop).css('left', `${(defaultWidth / 2) - 3.7}px`);
                    $newblock.css('height', `${usdPixelUnit_y * currentLoss}px`);
                } else if (isLast) {
                    formatted_xol_payout = formatLargeNumber(currentLoss - xol_ap);

                    $newblock.find(text_MiddleTop).remove();
                    $newblock.find(text_MiddleRight).find('.reinsurance--graph--text').text(`- ${formatted_xol_payout}`);
                    $newblock.find(text_MiddleRight).css('top', `${(currentLoss - xol_ap) / 2 * usdPixelUnit_y}px`);
                    $newblock.css('height', `${usdPixelUnit_y * currentLoss}px`);
                }
                // Cap block height at xol_max_limit if currentLoss exceeds it
                if (currentLoss > xol_max_limit) {
                    $newblock.css('height', `${usdPixelUnit_y * xol_max_limit}px`);
                    $newblock.css('border-top-right-radius', `0px`);
                    $newblock.css('border-top-left-radius', `0px`);
                    formattedLoss_total = formatLargeNumber(xol_max_limit - xol_ap);
                    $newblock.find('.reinsurance--graph--text').text(`- ${formattedLoss_total}`);
                    if ($newblock.find(text_MiddleRight).length > 0) {
                        $newblock.find(text_MiddleRight).css('top', `${(xol_max_limit - xol_ap) / 2 * usdPixelUnit_y}px`);
                    }
                }
                $newblock.show();
                $newblock.css('width', `84px`);
                dotPosition($newblock, 0, defaultWidth * index);
            } else if (type === 'agg') {
                $newblock.show();

                $newblock.css('width', `${aggBlockWidth}px`);

                $newblock.css('border-top-right-radius', `${$('.reinsurance--graph--block.base').eq(aggBlockIndex).css('border-top-right-radius')}`);
                $newblock.css('height', `${usdPixelUnit_y * currentLoss}px`);
                if (currentLoss > xol_ap) $newblock.css('height', `${usdPixelUnit_y * xol_ap}px`);
                if (!isXolActive && isAggActive && !isQuotaActive) $newblock.css('height', `${$('.reinsurance--graph--block.base').eq(aggBlockIndex).css('height')}`);
                dotPosition($newblock, 0, aggPosition);
                $newblock.css('top', `${$('.reinsurance--graph--block.base').eq(aggBlockIndex).css('top')}`);
                if ($('.reinsurance--graph--block.base').eq(aggBlockIndex).css('left') === $newblock.css('left')) {
                    $newblock.css('border-top-left-radius', `${$('.reinsurance--graph--block.base').eq(aggBlockIndex).css('border-top-left-radius')}`);
                } else {
                    $newblock.css('border-top-left-radius', `0px`);
                }
                let label = $('.reinsurance--graph--block.base').eq(aggBlockIndex).find(text_MiddleRight).find('.reinsurance--graph--text').text()
                $newblock.find(text_MiddleRight).find('.reinsurance--graph--text').text(`${label}`);
                if (!label.includes('+')) {
                    $newblock.find(text_MiddleRight).find('.reinsurance--graph--text').text(`+ ${label}`);
                }
                if (isAggLast) {
                    $newblock.find(text_MiddleRight).css('top', `${$('.reinsurance--graph--block.base').eq(aggBlockIndex).find(text_MiddleRight).css('top')}`);
                } else {
                    $newblock.find('.reinsurance--graph--dot').remove()
                    $('.reinsurance--graph--block.base').slice(aggBlockIndex + 1).each((i, el) => {
                        $(el).css('background-color', `${$newblock.css('background-color')}`);
                    });

                    $('.reinsurance--graph--block.base').find('.block--middle-right').find('img').attr('src', labelDecoration_purple)
                    $('.reinsurance--graph--block.base').find('.block--middle-right').find('img').attr('srcset', labelDecoration_purple)
                    $('.reinsurance--graph--block.base').find('.block--middle-right').find('.reinsurance--dot--label').css('background-color', `${$newblock.css('background-color')}`);
                    $('.reinsurance--graph--block.base').find('.block--middle-right').find('.reinsurance--dot--label').css('color', `#101D23`);

                    let oldLabel = $('.reinsurance--graph--block.base').find(text_MiddleRight).find('.reinsurance--graph--text').text()
                    console.log(oldLabel);
                    if (!oldLabel.includes('+')) $('.reinsurance--graph--block.base').find(text_MiddleRight).find('.reinsurance--graph--text').text(`+ ${oldLabel}`);


                }
                $('.reinsurance--graph--block.base').eq(aggBlockIndex).find('.reinsurance--graph--dot').remove()
            } else if (type === 'quota') {
                if (!quota_single) {
                    if (!isLast && !xol_limitReached) {
                        $newblock.find(text_MiddleRight).remove();
                        $newblock.find(text_MiddleTop).find('.reinsurance--graph--text').text(`- ${formatted_insurer_payout}`);
                        $newblock.find(text_MiddleTop).css('left', `${(defaultWidth / 2) * insurer_percentage - 3.7}px`);
                        $newblock.css('height', `min(${usdPixelUnit_y * currentLoss * insurer_percentage}px, 100%)`);

                    } else if (isLast && !xol_limitReached) {
                        formatted_insurer_payout = formatLargeNumber(xol_ap * insurer_percentage);
                        $newblock.find(text_MiddleTop).remove();
                        $newblock.find(text_MiddleRight).find('.reinsurance--graph--text').text(`- ${formatted_insurer_payout}`);
                        $newblock.find(text_MiddleRight).css('top', `${(currentLoss / 2) * insurer_percentage * usdPixelUnit_y}px`);
                        $newblock.css('height', `min(${usdPixelUnit_y * currentLoss * insurer_percentage}px, 100%)`);
                    } else if (!isLast && xol_limitReached) {
                        $newblock.find(text_MiddleRight).remove();
                        $newblock.find(text_MiddleTop).remove();
                        $newblock.css('height', `min(${usdPixelUnit_y * xol_ap * insurer_percentage}px, 100%)`);
                    } else if (isLast && xol_limitReached) {
                        formatted_insurer_payout = formatLargeNumber(xol_ap * insurer_percentage);

                        $newblock.find(text_MiddleTop).remove();
                        $newblock.find(text_MiddleRight).find('.reinsurance--graph--text').text(`- ${formatted_insurer_payout}`);
                        $newblock.find(text_MiddleRight).css('top', `${(xol_ap / 2) * insurer_percentage * usdPixelUnit_y}px`);
                        $newblock.css('height', `${usdPixelUnit_y * xol_ap * insurer_percentage}px`);
                        console.log(usdPixelUnit_y * xol_ap * insurer_percentage);
                    }
                } else {
                    console.log('currentLoss', currentLoss);
                    if (!isLast && currentLoss <= xol_max_limit) {
                        $newblock.find(text_MiddleRight).remove();
                        $newblock.find(text_MiddleTop).find('.reinsurance--graph--text').text(`- ${formatted_insurer_payout}`);

                        $newblock.find(text_MiddleTop).css('left', `${(defaultWidth / 2) * insurer_percentage - 3.7}px`);
                        $newblock.css('height', `min(${usdPixelUnit_y * currentLoss * insurer_percentage}px, 100%)`);

                    } else if (isLast && currentLoss <= xol_max_limit) {
                        formatted_insurer_payout = formatLargeNumber(currentLoss * insurer_percentage);
                        formatted_insured_payout = formatLargeNumber(currentLoss * insured_percentage);
                        $newblock.find(text_MiddleTop).remove();
                        $newblock.find(text_MiddleRight).find('.reinsurance--graph--text').text(`- ${formatted_insurer_payout}`);
                        $('.reinsurance--graph--block.base').eq(aggBlockIndex).find('.reinsurance--graph--text').text(`+ ${formatted_insured_payout}`);
                        $newblock.find(text_MiddleRight).css('top', `${(currentLoss / 2) * insurer_percentage * usdPixelUnit_y}px`);
                        $newblock.css('height', `min(${usdPixelUnit_y * currentLoss * insurer_percentage}px, 100%)`);
                      
                    } else if (!isLast && currentLoss > xol_max_limit) {
                        $newblock.find(text_MiddleRight).remove();
                        $newblock.find(text_MiddleTop).remove();
                        $newblock.css('height', `min(${usdPixelUnit_y * xol_max_limit * insurer_percentage}px, 100%)`);
                    } else if (isLast && currentLoss > xol_max_limit) {
                        formatted_insurer_payout = formatLargeNumber(xol_max_limit * insurer_percentage);
                        formatted_insured_payout = formatLargeNumber(currentLoss * insured_percentage);
                        $newblock.find(text_MiddleTop).remove();
                        $newblock.find(text_MiddleRight).find('.reinsurance--graph--text').text(`- ${formatted_insurer_payout}`);
                        $('.reinsurance--graph--block.base').eq(aggBlockIndex).find('.reinsurance--graph--text').text(`+ ${formatted_insured_payout}`);
                        $newblock.find(text_MiddleRight).css('top', `${(xol_max_limit / 2) * insurer_percentage * usdPixelUnit_y}px`);
                        $newblock.css('height', `${usdPixelUnit_y * xol_max_limit * insurer_percentage}px`);
                        console.log(usdPixelUnit_y * xol_max_limit * insurer_percentage);
                    }
                }
            }
        }


        //init render
        $('.reinsurance--graph--block').remove()
        dotPosition(dotMaxLimit, maxHeight, 0)
        dotPosition(sideLabelMax, maxHeight, 0)
        sideLabelMax.css('right', '16px')
        sideLabelMax.css('left', 'auto')
        dotPosition(dotXolAp, xol_ap * usdPixelUnit_y - 4.5, 0)
        dotPosition(sideLabelAp, xol_ap * usdPixelUnit_y - 22, sideLabelAp.css('left'))
        sideLabelAp.css('right', '16px')
        sideLabelAp.css('left', 'auto')
        linesStyle(false)
        dotAggAp.hide()
        aggLine.hide()


        dotMaxLimit.find('.reinsurance--graph--text').text(`${formatLargeNumber(xol_max_limit)} Max Limit`)
        dotXolAp.find('.reinsurance--graph--text').text(`${formatLargeNumber(xol_ap)} XoL AP`)
        dotAggAp.find('.reinsurance--graph--text').text(`${formatLargeNumber(agg_ap)} Agg AP`)
        sideLabelAp.text(`${formatLargeNumber(xol_ap)} XoL AP`)
        sideLabelMax.text(`${formatLargeNumber(xol_max_limit)} Max Limit`)





        if (!isXolActive && !isAggActive && !isQuotaActive) {
            //do nothing
            $('.reinsurance--graph').children().hide()
            $('.reinsurance--axis--vertical').css('display', 'flex')
            $('.reinsurance--axis--horizontal').css('display', 'flex')

        } else if (!isXolActive && isAggActive && !isQuotaActive) {
            const elements = $('.reinsurance--slider--card.loss').find('.reinsurance--input');
            const numberOfLosses = elements.length;
            elements.each((index, element) => {
                let currentLoss = parseToNumber($(element).val());


                if (currentLoss > 0) {
                    let $newBlock_base = addReinsuranceBlock(baseBlockTemplate);

                    if (index < numberOfLosses - 1) {
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: false, xol_limitReached: false, xol_max_limit })
                    } else if (index === numberOfLosses - 1) {
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: true, xol_limitReached: false, xol_max_limit })
                    }

                    // Common properties for all blocks
                    $newBlock_base.css('width', `84px`);
                    dotPosition($newBlock_base, 0, defaultWidth * index);
                    $newBlock_base.show();
                }
            });

            let relativePosition = 100
            let totalLoss = 0
            $('.reinsurance--slider--card.loss').find('.reinsurance--input').each((index, element) => {
                let currentLoss = parseToNumber($(element).val());
                totalLoss = totalLoss + currentLoss

                if (totalLoss <= agg_ap) {
                    relativePosition = 84 * (index + 1)
                    if (totalLoss !== agg_ap) dotAggAp.find('.reinsurance--graph--text').text(`${formatLargeNumber(agg_ap)} Agg AP (%${Math.round((agg_ap - totalLoss) / agg_ap * 100)} left)`)
                    else dotAggAp.find('.reinsurance--graph--text').text(`${formatLargeNumber(agg_ap)} Agg AP`)
                } else if (totalLoss > agg_ap) {
                    let $newBlock_agg = addReinsuranceBlock(aggBlockTemplate);

                    console.log(aggPayouts_array[index])
                    widthPercentage = aggPayouts_array[index] / currentLoss
                    relativePosition = 84 * widthPercentage + (index) * 84;
                    aggBlockWidth = 84 - 84 * widthPercentage
                    dotAggAp.find('.reinsurance--graph--text').text(`${formatLargeNumber(agg_ap)} Agg AP`)
                    //if last
                    //hide last base block dot
                    // copy dot position to agg
                    //else
                    //hide last base block dot
                    // copy dot position to agg
                    //
                    if (index === numberOfLosses - 1) {
                        blockStyle({ type: 'agg', $newblock: $newBlock_agg, isLast: true, aggPosition: relativePosition, aggBlockWidth, aggBlockIndex: index, isAggLast: true, currentLoss })
                    } else {
                        blockStyle({ type: 'agg', $newblock: $newBlock_agg, isLast: false, aggPosition: relativePosition, aggBlockWidth, aggBlockIndex: index, isAggLast: false, currentLoss })
                    }

                    return false;

                }
            });

            dotPosition(dotAggAp, 9, relativePosition)
            dotPosition(aggLine, 0, relativePosition)
            dotAggAp.css('display', 'flex')
            aggLine.show()

            if ($('.reinsurance--graph--block.base').length === 0) return;
            linesStyle(true, true)
            dotPosition(dotAggAp, - 64, dotAggAp.css('left'))

        } else if (!isXolActive && !isAggActive && isQuotaActive) {
            dotMaxLimit.css('display', 'flex')
            sideLabelAp.css('display', 'flex')
            sideLabelMax.css('display', 'flex')


            const elements = $('.reinsurance--slider--card.loss').find('.reinsurance--input');
            const numberOfLosses = elements.length;

            elements.each((index, element) => {
                let currentLoss = parseToNumber($(element).val());


                if (currentLoss > 0) {
                    let $newBlock_base = addReinsuranceBlock(baseBlockTemplate);
                    let $newBlock_quota = addReinsuranceBlock(quotaBlockTemplate);

                    if (index < numberOfLosses - 1 && currentLoss <= xol_max_limit) { // if block is not last and loss is less than or equal to XoL AP
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: false, xol_max_limit, insured_percentage, quota_single: true })
                        blockStyle({ index, type: 'quota', $newblock: $newBlock_quota, currentLoss, isLast: false, xol_max_limit, insurer_percentage, insured_percentage, quota_single: true })
                    } else if (index === numberOfLosses - 1 && currentLoss <= xol_max_limit) { // if block is last and loss is less than or equal to XoL AP
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: true, xol_max_limit, insured_percentage, quota_single: true })
                        blockStyle({ index, type: 'quota', $newblock: $newBlock_quota, currentLoss, isLast: true, xol_max_limit, insurer_percentage, insured_percentage, quota_single: true })
                    } else if (index < numberOfLosses - 1 && currentLoss > xol_max_limit) { // if block is not last and loss is greater than XoL AP
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: false, xol_max_limit, insured_percentage, quota_single: true })
                        blockStyle({ index, type: 'quota', $newblock: $newBlock_quota, currentLoss, isLast: false, xol_max_limit, insurer_percentage, insured_percentage, quota_single: true })
                    } else if (index === numberOfLosses - 1 && currentLoss > xol_max_limit) { // if block is last and loss is greater than XoL AP
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: true, xol_max_limit, insured_percentage, quota_single: true })
                        blockStyle({ index, type: 'quota', $newblock: $newBlock_quota, currentLoss, isLast: true, xol_max_limit, insurer_percentage, insured_percentage, quota_single: true })
                    }

                    // Common properties for all blocks
                    $newBlock_base.css('width', `84px`);
                    $newBlock_quota.css('width', `84px`);
                    dotPosition($newBlock_base, 0, defaultWidth * index);
                    dotPosition($newBlock_quota, 0, defaultWidth * index);
                    $newBlock_base.show();
                    $newBlock_quota.show();
                }
            });


            if ($('.reinsurance--graph--block.base').length === 0) return;
            linesStyle(true)

        } else if (isXolActive && !isAggActive && !isQuotaActive) {
            dotXolAp.css('display', 'flex')
            dotMaxLimit.css('display', 'flex')
            sideLabelAp.css('display', 'flex')
            sideLabelMax.css('display', 'flex')


            const elements = $('.reinsurance--slider--card.loss').find('.reinsurance--input');
            const numberOfLosses = elements.length;

            elements.each((index, element) => {
                let currentLoss = parseToNumber($(element).val());


                if (currentLoss > 0) {
                    let $newBlock_base = addReinsuranceBlock(baseBlockTemplate);

                    if (index < numberOfLosses - 1 && currentLoss <= xol_ap) {
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: false, xol_limitReached: false, xol_max_limit })
                    } else if (index === numberOfLosses - 1 && currentLoss <= xol_ap) {
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: true, xol_limitReached: false, xol_max_limit })
                    } else if (index < numberOfLosses - 1 && currentLoss > xol_ap) {
                        let $newBlock_xol = addReinsuranceBlock(xolBlockTemplate);
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: false, xol_limitReached: true, xol_max_limit })
                        blockStyle({ index, type: 'xol', $newblock: $newBlock_xol, currentLoss, isLast: false, xol_max_limit })
                    } else if (index === numberOfLosses - 1 && currentLoss > xol_ap) {
                        let $newBlock_xol = addReinsuranceBlock(xolBlockTemplate);
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: true, xol_limitReached: true, xol_max_limit })
                        blockStyle({ index, type: 'xol', $newblock: $newBlock_xol, currentLoss, isLast: true, xol_max_limit })
                    }

                    // Common properties for all blocks
                    $newBlock_base.css('width', `84px`);
                    dotPosition($newBlock_base, 0, defaultWidth * index);
                    $newBlock_base.show();
                }
            });


            if ($('.reinsurance--graph--block.base').length === 0) return;
            linesStyle(true)



        } else if (isXolActive && isAggActive && !isQuotaActive) {
            dotXolAp.css('display', 'flex')
            dotMaxLimit.css('display', 'flex')
            sideLabelAp.css('display', 'flex')
            sideLabelMax.css('display', 'flex')

            const elements = $('.reinsurance--slider--card.loss').find('.reinsurance--input');
            const numberOfLosses = elements.length;

            elements.each((index, element) => {
                let currentLoss = parseToNumber($(element).val());


                if (currentLoss > 0) {
                    let $newBlock_base = addReinsuranceBlock(baseBlockTemplate);

                    if (index < numberOfLosses - 1 && currentLoss <= xol_ap) {
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: false, xol_limitReached: false, xol_max_limit })
                    } else if (index === numberOfLosses - 1 && currentLoss <= xol_ap) {
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: true, xol_limitReached: false, xol_max_limit })
                    } else if (index < numberOfLosses - 1 && currentLoss > xol_ap) {
                        let $newBlock_xol = addReinsuranceBlock(xolBlockTemplate);
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: false, xol_limitReached: true, xol_max_limit })
                        blockStyle({ index, type: 'xol', $newblock: $newBlock_xol, currentLoss, isLast: false, xol_max_limit })
                    } else if (index === numberOfLosses - 1 && currentLoss > xol_ap) {
                        let $newBlock_xol = addReinsuranceBlock(xolBlockTemplate);
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: true, xol_limitReached: true, xol_max_limit })
                        blockStyle({ index, type: 'xol', $newblock: $newBlock_xol, currentLoss, isLast: true, xol_max_limit })
                    }

                    // Common properties for all blocks
                    $newBlock_base.css('width', `84px`);
                    dotPosition($newBlock_base, 0, defaultWidth * index);
                    $newBlock_base.show();
                }
            });

            let relativePosition = 100
            let totalLoss = 0
            $('.reinsurance--slider--card.loss').find('.reinsurance--input').each((index, element) => {
                let currentLoss = parseToNumber($(element).val());
                totalLoss = totalLoss + currentLoss

                if (totalLoss <= agg_ap) {
                    relativePosition = 84 * (index + 1)
                    if (totalLoss !== agg_ap) dotAggAp.find('.reinsurance--graph--text').text(`${formatLargeNumber(agg_ap)} Agg AP (%${Math.round((agg_ap - totalLoss) / agg_ap * 100)} left)`)
                    else dotAggAp.find('.reinsurance--graph--text').text(`${formatLargeNumber(agg_ap)} Agg AP`)
                } else if (totalLoss > agg_ap) {
                    let $newBlock_agg = addReinsuranceBlock(aggBlockTemplate);

                    console.log(aggPayouts_array[index])
                    widthPercentage = aggPayouts_array[index] / xol_ap
                    if (currentLoss < xol_ap) widthPercentage = aggPayouts_array[index] / currentLoss
                    relativePosition = 84 * widthPercentage + (index) * 84;
                    aggBlockWidth = 84 - 84 * widthPercentage
                    dotAggAp.find('.reinsurance--graph--text').text(`${formatLargeNumber(agg_ap)} Agg AP`)
                    //if last
                    //hide last base block dot
                    // copy dot position to agg
                    //else
                    //hide last base block dot
                    // copy dot position to agg
                    //
                    if (index === numberOfLosses - 1) {
                        blockStyle({ type: 'agg', $newblock: $newBlock_agg, isLast: true, aggPosition: relativePosition, aggBlockWidth, aggBlockIndex: index, isAggLast: true, currentLoss })
                    } else {
                        blockStyle({ type: 'agg', $newblock: $newBlock_agg, isLast: false, aggPosition: relativePosition, aggBlockWidth, aggBlockIndex: index, isAggLast: false, currentLoss })
                    }

                    return false;

                }
            });

            dotPosition(dotAggAp, 9, relativePosition)
            dotPosition(aggLine, 0, relativePosition)
            dotXolAp.css('display', 'flex')
            dotAggAp.css('display', 'flex')
            dotMaxLimit.css('display', 'flex')
            aggLine.show()

            if ($('.reinsurance--graph--block.base').length === 0) return;
            linesStyle(true, true)
            dotPosition(dotAggAp, - 64, dotAggAp.css('left'))

        } else if (isXolActive && !isAggActive && isQuotaActive) {
            dotMaxLimit.css('display', 'flex')
            sideLabelAp.css('display', 'flex')
            sideLabelMax.css('display', 'flex')


            const elements = $('.reinsurance--slider--card.loss').find('.reinsurance--input');
            const numberOfLosses = elements.length;

            elements.each((index, element) => {
                let currentLoss = parseToNumber($(element).val());


                if (currentLoss > 0) {
                    let $newBlock_base = addReinsuranceBlock(baseBlockTemplate);
                    let $newBlock_quota = addReinsuranceBlock(quotaBlockTemplate);

                    if (index < numberOfLosses - 1 && currentLoss <= xol_ap) { // if block is not last and loss is less than or equal to XoL AP
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: false, xol_limitReached: false, xol_max_limit, insured_percentage })
                        blockStyle({ index, type: 'quota', $newblock: $newBlock_quota, currentLoss, isLast: false, xol_limitReached: false, insurer_percentage, insured_percentage })
                    } else if (index === numberOfLosses - 1 && currentLoss <= xol_ap) { // if block is last and loss is less than or equal to XoL AP
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: true, xol_limitReached: false, xol_max_limit, insured_percentage })
                        blockStyle({ index, type: 'quota', $newblock: $newBlock_quota, currentLoss, isLast: true, xol_limitReached: false, insurer_percentage, insured_percentage })
                    } else if (index < numberOfLosses - 1 && currentLoss > xol_ap) { // if block is not last and loss is greater than XoL AP
                        let $newBlock_xol = addReinsuranceBlock(xolBlockTemplate);
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: false, xol_limitReached: true, xol_max_limit, insured_percentage })
                        blockStyle({ index, type: 'xol', $newblock: $newBlock_xol, currentLoss, isLast: false, xol_max_limit })
                        blockStyle({ index, type: 'quota', $newblock: $newBlock_quota, currentLoss, isLast: false, xol_limitReached: true, insurer_percentage, insured_percentage })

                    } else if (index === numberOfLosses - 1 && currentLoss > xol_ap) { // if block is last and loss is greater than XoL AP
                        let $newBlock_xol = addReinsuranceBlock(xolBlockTemplate);
                        blockStyle({ index, type: 'base', $newblock: $newBlock_base, currentLoss, isLast: true, xol_limitReached: true, xol_max_limit, insured_percentage })
                        blockStyle({ index, type: 'xol', $newblock: $newBlock_xol, currentLoss, isLast: true, xol_max_limit })
                        blockStyle({ index, type: 'quota', $newblock: $newBlock_quota, currentLoss, isLast: true, xol_limitReached: true, insurer_percentage, insured_percentage })

                    }

                    // Common properties for all blocks
                    $newBlock_base.css('width', `84px`);
                    $newBlock_quota.css('width', `84px`);
                    dotPosition($newBlock_base, 0, defaultWidth * index);
                    dotPosition($newBlock_quota, 0, defaultWidth * index);
                    $newBlock_base.show();
                    $newBlock_quota.show();
                }
            });


            if ($('.reinsurance--graph--block.base').length === 0) return;
            linesStyle(true)


        } else if (isXolActive && isAggActive && isQuotaActive) {
            //do nothing
        }
    }
    const handleCalculations = () => {
        const isXolActive = $('#xol').hasClass('active');
        const isAggActive = $('#agg').hasClass('active');
        const isQuotaActive = $('#quota').hasClass('active');

        let XoL_AP = parseToNumber($('#xol-ap').val());
        let XoL_MaxLimit = parseToNumber($('#xol-ml').val());
        let agg_AP = parseToNumber($('#agg-ap').val());
        let initialBalance = parseToNumber($('#initial-balance').val());
        let newBalance = initialBalance, XoL_Payout = 0, current_xol_payout = 0, totalLoss = 0;
        let insured_percentage = parseToNumber($('#quota-share--reinsurer').val());
        let insurer_percentage = parseToNumber($('#quota-share--responsibility').val());
        let aggPayouts_array = []



        if (!isXolActive && !isAggActive && !isQuotaActive) {
            console.log('state 1-2');
            console.log('nothing to do');
        } else if (!isXolActive && isAggActive && !isQuotaActive) {
            console.log('state 3');
            let agg_current_payout = 0
            let agg_total_payout = 0
            let aggCheckpoint = 0
            $('.reinsurance--slider--card.loss').find('.reinsurance--input').each((index, element) => {
                let currentLoss = parseToNumber($(element).val());
                totalLoss = totalLoss + currentLoss;
                if (totalLoss > agg_AP) {
                    agg_current_payout = currentLoss
                    console.log('here')
                    if (aggCheckpoint === 0) {
                        agg_current_payout = agg_AP - (totalLoss - currentLoss)
                        aggCheckpoint++
                        newBalance = newBalance - (currentLoss - agg_current_payout)
                    }

                } else {
                    newBalance = newBalance - currentLoss;
                }

                aggPayouts_array.push(agg_current_payout)
                agg_total_payout = agg_total_payout + agg_current_payout
            });


            cardBalance.text(formatToDollar(newBalance));
            cardAggPayout.text(formatToDollar(agg_total_payout));

        } else if (!isXolActive && !isAggActive && isQuotaActive) {
            console.log('state 4');
            let currentQuota_payout = 0
            let totalQuota = 0


            $('.reinsurance--slider--card.loss').find('.reinsurance--input').each((index, element) => {
                let currentLoss = parseToNumber($(element).val());

                totalLoss = totalLoss + currentLoss;

                if (currentLoss > XoL_MaxLimit) {
                    currentQuota_payout = XoL_MaxLimit * insured_percentage
                    newBalance = newBalance - currentLoss + XoL_MaxLimit * insurer_percentage;
                } else {
                    currentQuota_payout = currentLoss * insured_percentage
                    newBalance = newBalance - currentLoss * insurer_percentage
                }

                totalQuota = totalQuota + currentQuota_payout
            });


            // Display the new balance and XoL Payout using the formatting utility
            cardBalance.text(formatToDollar(newBalance));
            cardQuotaPayout.text(formatToDollar(totalQuota))

        } else if (isXolActive && !isAggActive && !isQuotaActive) {
            console.log('state 5');

            $('.reinsurance--slider--card.loss').find('.reinsurance--input').each((index, element) => {
                let currentLoss = parseToNumber($(element).val());

                totalLoss = totalLoss + currentLoss;

                if (currentLoss - XoL_AP < 0) {
                    // No payout, just subtract the loss from the balance
                    newBalance = newBalance - currentLoss;
                } else if (currentLoss > XoL_MaxLimit) {
                    // Loss exceeds AP and Max Limit, full payout up to Max Limit
                    XoL_Payout = XoL_Payout + (XoL_MaxLimit - XoL_AP);
                    let current_Payout = XoL_MaxLimit - XoL_AP
                    newBalance = newBalance - (currentLoss - current_Payout);
                } else {
                    // Loss exceeds AP but within Max Limit, payout up to Loss - AP
                    let payout = currentLoss - XoL_AP;
                    XoL_Payout += payout;
                    newBalance -= XoL_AP
                }
            });

            // Display the new balance and XoL Payout using the formatting utility
            cardBalance.text(formatToDollar(newBalance));
            cardXolPayout.text(formatToDollar(XoL_Payout));


        } else if (isXolActive && isAggActive && !isQuotaActive) {
            console.log('state 6');

            let agg_current_payout = 0
            let agg_total_payout = 0
            let aggCheckpoint = 0


            $('.reinsurance--slider--card.loss').find('.reinsurance--input').each((index, element) => {
                let currentLoss = parseToNumber($(element).val());
                if (currentLoss === 0) return;

                totalLoss = totalLoss + currentLoss;
                if (currentLoss < XoL_MaxLimit && currentLoss > XoL_AP) {
                    // check Agg before anything else
                    if (totalLoss > agg_AP) {
                        agg_current_payout = XoL_AP
                        console.log('here')
                        if (aggCheckpoint === 0) {
                            agg_current_payout = agg_AP - (totalLoss - currentLoss)
                            aggCheckpoint++
                        }

                        newBalance = newBalance - agg_AP
                    } else {
                        newBalance = newBalance - currentLoss;
                    }
                    current_xol_payout = currentLoss - XoL_AP
                    XoL_Payout = XoL_Payout + current_xol_payout

                } else if (currentLoss < XoL_MaxLimit) {
                    // check Agg before anything else
                    if (totalLoss > agg_AP) {
                        agg_current_payout = currentLoss
                        console.log('here')
                        if (aggCheckpoint === 0) {
                            agg_current_payout = agg_AP - (totalLoss - currentLoss)
                            aggCheckpoint++
                        }

                        newBalance = newBalance - agg_AP
                    } else {
                        newBalance = newBalance - currentLoss;
                    }

                } else if (currentLoss > XoL_MaxLimit) {
                    if (totalLoss > agg_AP) {
                        agg_current_payout = XoL_AP
                        if (aggCheckpoint === 0) {
                            agg_current_payout = totalLoss - XoL_MaxLimit - XoL_AP
                            aggCheckpoint++
                        }
                        let agg_payment_insured = initialBalance - newBalance - XoL_AP
                        current_xol_payout = 0
                        newBalance = newBalance - agg_payment_insured
                        current_xol_payout = XoL_MaxLimit - XoL_AP
                        XoL_Payout = XoL_Payout + current_xol_payout
                    } else {
                        XoL_Payout = XoL_Payout + (XoL_MaxLimit - XoL_AP);
                        let current_Payout = XoL_MaxLimit - XoL_AP
                        newBalance = newBalance - (currentLoss - current_Payout);
                    }

                } else {
                    if (totalLoss > agg_AP) {
                        agg_current_payout = currentLoss
                        if (aggCheckpoint === 0) {
                            agg_current_payout = totalLoss - XoL_MaxLimit - XoL_AP
                            aggCheckpoint++
                        }

                        let agg_payment_insured = initialBalance - newBalance - XoL_AP
                        current_xol_payout = 0
                        newBalance = newBalance - agg_payment_insured

                    } else {
                        let payout = currentLoss - XoL_AP;
                        XoL_Payout = XoL_Payout + payout;
                        newBalance = newBalance - XoL_AP
                    }


                }
                aggPayouts_array.push(agg_current_payout)
                agg_total_payout = agg_total_payout + agg_current_payout
            });
            console.log(aggPayouts_array)
            // Display the new balance and XoL Payout using the formatting utility


            cardBalance.text(formatToDollar(newBalance));
            cardXolPayout.text(formatToDollar(XoL_Payout));
            cardAggPayout.text(formatToDollar(agg_total_payout));
        } else if (isXolActive && !isAggActive && isQuotaActive) {
            console.log('state 7');
            // here, the quota will only get the percentage based on what the captive is paying, so XoL and Quota dont touch each other
            let currentQuota_payout = 0
            let totalQuota = 0


            $('.reinsurance--slider--card.loss').find('.reinsurance--input').each((index, element) => {
                let currentLoss = parseToNumber($(element).val());

                totalLoss = totalLoss + currentLoss;

                if (currentLoss - XoL_AP < 0) {
                    // No payout, just subtract the loss from the balance
                    currentQuota_payout = currentLoss * insured_percentage
                    newBalance = newBalance - currentLoss * insurer_percentage;
                } else if (currentLoss > XoL_MaxLimit) {
                    // Loss exceeds AP and Max Limit, full payout up to Max Limit
                    XoL_Payout = XoL_Payout + (XoL_MaxLimit - XoL_AP);
                    let current_Payout = XoL_MaxLimit - XoL_AP
                    currentQuota_payout = (currentLoss - current_Payout) * insured_percentage
                    newBalance = newBalance - (currentLoss - current_Payout) * insurer_percentage;
                } else {
                    // Loss exceeds AP but within Max Limit, payout up to Loss - AP
                    let payout = currentLoss - XoL_AP;
                    XoL_Payout += payout;
                    currentQuota_payout = XoL_AP * insured_percentage
                    newBalance = newBalance - XoL_AP * insurer_percentage
                }

                totalQuota = totalQuota + currentQuota_payout
            });


            // Display the new balance and XoL Payout using the formatting utility
            cardBalance.text(formatToDollar(newBalance));
            cardXolPayout.text(formatToDollar(XoL_Payout));
            cardQuotaPayout.text(formatToDollar(totalQuota))

        } else if (isXolActive && isAggActive && isQuotaActive) {
            //do nothing
        }

        renderGraph(isXolActive, isAggActive, isQuotaActive, XoL_MaxLimit, XoL_AP, agg_AP, aggPayouts_array, insured_percentage, insurer_percentage)

    };







    /* INPUTS HANDLER */


    $('.reinsurance--apply--button').on('click', (e) => {
        $('.reinsurance--graph--block').remove()
        handleCalculations()
    });


    $('.reinsurance--card--header').on('click', (e) => {
        controller.inputCard($(e.currentTarget).closest('.reinsurance--slider--card'));
    });

    $('.reinsurance--add--row').on('click', (e) => {
        controller.addLoss();
        $('.reinsurance--total-loss--row').css('display', 'flex')
    });

    $(document).on('change', '.reinsurance--slider--card.loss .reinsurance--input', (e) => {
        controller.calculateLoss();
    });

    $(document).on('click', '.reinsurance--reset--button', (e) => {
        $('#initial-balance').val('$2,000,000')
        $('#xol-ap').val('$200,000')
        $('#xol-ml').val('$1,000,000')
        $('#initialLoss').val('$100,000')
        $('#quota-share--reinsurer').val('50%')
        $('#quota-share--responsibility').val('50%')
        handleCalculations()
    });


    /* QUOTA SLIDER HANDLER START*/

    $('.reinsurance-slider--progress--button').on('mousedown', function (e) {
        dragging = true;
        e.preventDefault(); // Prevent text selection during drag
    });

    $(document).on('mousemove', function (e) {
        if (dragging) {
            let slider = $('.reinsurance-slider--progress');
            let sliderOffset = slider.offset().left;
            let sliderWidth = slider.parent().width();
            let newWidth = Math.min(Math.max(e.pageX - sliderOffset, 0), sliderWidth);
            let percentage = (newWidth / sliderWidth) * 100;

            // Update slider width and inputs
            controller.adjustSliderAndInputs(Math.round(percentage));
        }
    });

    $(document).on('mouseup', function () {
        dragging = false;
    });

    // Handle touch events for mobile devices
    $('.reinsurance-slider--progress--button').on('touchstart', function (e) {
        dragging = true;
        e.preventDefault(); // Prevent text selection during drag
    });

    $(document).on('touchmove', function (e) {
        if (dragging) {
            let slider = $('.reinsurance-slider--progress');
            let sliderOffset = slider.offset().left;
            let sliderWidth = slider.parent().width();
            let touch = e.originalEvent.touches[0]; // Get the first touch point
            let newWidth = Math.min(Math.max(touch.pageX - sliderOffset, 0), sliderWidth);
            let percentage = (newWidth / sliderWidth) * 100;

            // Update slider width and inputs
            controller.adjustSliderAndInputs(Math.round(percentage));
        }
    });

    $(document).on('touchend', function () {
        dragging = false;
    });


    $('#quota-share--responsibility').on('input', function (e) {
        let responsibilityValue = parseFloat($(e.target).val().replace(/[^0-9.]/g, '')) || 0;
        responsibilityValue = Math.min(Math.max(responsibilityValue, 0), 100);  // Ensure 0-100%
        controller.adjustSliderAndInputs(responsibilityValue);
    });

    $('#quota-share--reinsurer').on('input', function (e) {
        let reinsurerValue = parseFloat($(e.target).val().replace(/[^0-9.]/g, '')) || 0;
        let responsibilityValue = 100 - reinsurerValue;
        responsibilityValue = Math.min(Math.max(responsibilityValue, 0), 100);  // Ensure 0-100%
        controller.adjustSliderAndInputs(responsibilityValue);
    });
    /* QUOTA SLIDER HANDLER END*/

    // remove losses
    $(document).on('mouseenter', '.reinsurance--loss--row', (e) => {
        $(e.target).find('.reinsurance--loss--remove').addClass('active');
    });
    $(document).on('mouseleave', '.reinsurance--loss--row', (e) => {
        $(e.target).find('.reinsurance--loss--remove').removeClass('active');
    });

    $(document).on('click', '.reinsurance--loss--remove', (e) => {
        if ($(e.target).closest('.reinsurance--loss--row').index() !== 0) {
            $(e.target).closest('.reinsurance--loss--row').remove();
        }
        handleCalculations();
    });


    /* START SYSTEM */
    $('.reinsurance--rows').hide();
    $('.reinsurance--rows').css('height', '0px');
    $('.reinsurance--rows').css('opacity', '0%');

    $('#input--agg-point').hide()
    $('#input--quota-share').hide()
    $('.reinsurance--summary--card.agg-payout').hide()
    $('.reinsurance--summary--card.quota-payout').hide()

    $('.reinsurance--total-loss--row').hide()


    $('.reinsurance--input').each(function () {
        controller.formatDollarInput($(this));
    });

    $('#initial-balance').val('$2,000,000')
    $('#xol-ap').val('$200,000')
    $('#xol-ml').val('$1,000,000')
    $('#initialLoss').val('$100,000')
    $('#quota-share--reinsurer').val('50%')
    $('#quota-share--responsibility').val('50%')

    // graph start
    $('#dot--agg-ap').hide()
    $('.reinsurance--agg-line').hide()
    $('#dot--ap').hide()
    $('#dot--max-limit').hide()

    $('.reinsurance--card--header').eq(0).trigger('click')

    $('form').on('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            $('.reinsurance--apply--button').eq(0).trigger('click')
        }
    });



});


/* 
Graph States

- Global
    When no losses are active, gray out result cards

- Squares
    width of 83px unless squished
    height: based on the maximum XoL Limit, 
        so XoL_limit <---> current_Graph_height (px)
               1($)      <---> X
               X = XoL_Limit/ current_graph_height
- XoL 
    No Losses:
        Max limit and XoL AP dots on Y axis (full line in background)
    With Losses:
        Dots on Y axis dont show, but line and limit values shows at far right
        Loss Instance:
            -  If Loss > than XoL AP
                Dark blue rectangle with dot on center top and amount value
            - Else if Loss < XoL AP && is last loss in the row
                Dark Blue Square:
                    Dot with black marker on the middle left of the square
                    Black info card has a - To indicate insured losing money
                Light Blue Square:
                    Dot with black marker on height (light blue height - dark blue height)/2 and left (basically in the middle of visible light blue square)
                    Black info card has a + To indicate insurer payout
            - Else if Loss < XoL AP && is NOT last loss in the row
                Dark blue rectangle with dot on center top and amount value
                light blue rectangle with dot on center top and amount value
- XoL && Agg
    - 
*/