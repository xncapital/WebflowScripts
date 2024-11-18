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

        $('#max-limit--input--label').text('XoL Max (per occurrence)')
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
            $('#max-limit--input--label').text('Quota Max(per occurrence)')
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
    const baseBlockTemplate = $('.reinsurance--blocks').clone();

    // Remove the original blocks from the DOM to avoid interference
    $('.reinsurance--blocks').remove();


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


    const renderGraph = (isXolActive, isAggActive, isQuotaActive, xol_max_limit, xol_ap, agg_ap, insured_percentage, insurer_percentage, aggCheckpointWidth
    ) => {

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


        //init render
        $('.reinsurance--graph--block').remove()
        dotPosition(dotMaxLimit, maxHeight, 0)
        dotPosition(sideLabelMax, maxHeight, 0)
        sideLabelMax.css('right', '16px')
        sideLabelMax.css('left', 'auto')
        dotPosition(dotXolAp, xol_ap * usdPixelUnit_y - 4.5, 0)
        dotPosition(sideLabelAp, xol_ap * usdPixelUnit_y - 22, sideLabelAp.css('left'))
        sideLabelAp.css('right', '8px')
        sideLabelAp.css('left', 'auto')
        dotAggAp.hide()
        aggLine.hide()

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


        dotMaxLimit.find('.reinsurance--graph--text').text(`${formatLargeNumber(xol_max_limit)} Max`)
        dotXolAp.find('.reinsurance--graph--text').text(`${formatLargeNumber(xol_ap)} XoL AP`)
        dotAggAp.find('.reinsurance--graph--text').text(`${formatLargeNumber(agg_ap)} Agg AP`)
        sideLabelAp.text(`${formatLargeNumber(xol_ap)} XoL AP`)
        sideLabelMax.text(`${formatLargeNumber(xol_max_limit)} Max`)

        linesStyle(true)

        $('.reinsurance--blocks').remove();

        $('.reinsurance--loss--row').each((index, element) => {
            const newBlock = baseBlockTemplate.clone();
            $('.reinsurance--graph').append(newBlock);
        });

        console.log(captivePayouts_array)
        console.log(quotaPayouts_array)
        console.log(xolPayouts_array)

        if (!isXolActive && !isAggActive && !isQuotaActive) {
            //do nothing
            $('.reinsurance--graph').children().hide()
            $('.reinsurance--axis--vertical').css('display', 'flex')
            $('.reinsurance--axis--horizontal').css('display', 'flex')
        } else if (isXolActive && !isAggActive && !isQuotaActive) {
            dotXolAp.css('display', 'flex')
            dotMaxLimit.css('display', 'flex')
            sideLabelAp.css('display', 'flex')
            sideLabelMax.css('display', 'flex')

            const baseBlocks = $('.reinsurance--graph--block.base')
            const baseBlocks_excess = $('.reinsurance--graph--block.base-excess')
            const xolBlocks = $('.reinsurance--graph--block.xol')


            baseBlocks.each((index, element) => {
                let currentLoss = parseToNumber($('.reinsurance--slider--card.loss').find('.reinsurance--input').eq(index).val());


                if (currentLoss === 0) {
                    $(element).remove()
                } else {
                    $(element).css('display', 'flex');
                    $(element).css('height', `${captivePayouts_array[index] * usdPixelUnit_y}px`);
                    $(element).find('.reinsurance--block--value').text(`- ${formatLargeNumber(captivePayouts_array[index])}`)
                    if (xolPayouts_array[index] > 0) {
                        $(xolBlocks).eq(index).css('display', 'flex')
                        $(xolBlocks).eq(index).css('height', `${(xolPayouts_array[index] + captivePayouts_array[index]) * usdPixelUnit_y}px`);
                        $(xolBlocks).eq(index).find('.reinsurance--block--value').text(formatLargeNumber(xolPayouts_array[index]))
                        $(xolBlocks).eq(index).find('.reinsurance--block--value').css('position', 'absolute')
                        $(xolBlocks).eq(index).find('.reinsurance--block--value').css('top', `${xolPayouts_array[index] * usdPixelUnit_y * 0.5 - 6}px`)
                    }

                    if (captivePayouts_array_above_max[index] > 0) {

                        $(baseBlocks_excess).eq(index).css('display', 'flex')
                        $(baseBlocks_excess).eq(index).css('top', '-45px')
                        $(baseBlocks_excess).eq(index).css('height', `55px`);
                        $(baseBlocks_excess).eq(index).find('.reinsurance--block--value').text(`- ${formatLargeNumber(captivePayouts_array_above_max[index])}`)
                    }
                }


            });


            if ($('.reinsurance--graph--block.base').length === 0) return;
            linesStyle(true)
        } else if (!isXolActive && isAggActive && !isQuotaActive) {

        } else if (isXolActive && isAggActive && !isQuotaActive) {
            dotXolAp.css('display', 'flex')
            dotMaxLimit.css('display', 'flex')
            sideLabelAp.css('display', 'flex')
            sideLabelMax.css('display', 'flex')

            const baseBlocks = $('.reinsurance--graph--block.base')
            const baseBlocks_excess = $('.reinsurance--graph--block.base-excess')
            const xolBlocks = $('.reinsurance--graph--block.xol')
            const aggBlocks = $('.reinsurance--graph--block.agg')

            let totalLoss = 0
            let relativePosition = 0
            baseBlocks.each((index, element) => {
                let currentLoss = parseToNumber($('.reinsurance--slider--card.loss').find('.reinsurance--input').eq(index).val());
                totalLoss = totalLoss + currentLoss

                if (currentLoss === 0) {
                    $(element).remove()
                } else {
                    $(element).css('display', 'flex');
                    $(element).css('height', `${(captivePayouts_array[index] + aggPayouts_array[index]) * usdPixelUnit_y}px`);
                    $(element).find('.reinsurance--block--value').text(`- ${formatLargeNumber(captivePayouts_array[index])}`)

                    if (xolPayouts_array[index] > 0) {
                        $(xolBlocks).eq(index).css('display', 'flex')
                        $(xolBlocks).eq(index).css('height', `${(xolPayouts_array[index] + captivePayouts_array[index] + aggPayouts_array[index]) * usdPixelUnit_y}px`);
                        $(xolBlocks).eq(index).find('.reinsurance--block--value').text(formatLargeNumber(xolPayouts_array[index]))
                        $(xolBlocks).eq(index).find('.reinsurance--block--value').css('position', 'absolute')
                        $(xolBlocks).eq(index).find('.reinsurance--block--value').css('top', `${xolPayouts_array[index] * usdPixelUnit_y * 0.5 - 6}px`)
                    }

                    if (captivePayouts_array_above_max[index] > 0) {

                        $(baseBlocks_excess).eq(index).css('display', 'flex')
                        $(baseBlocks_excess).eq(index).css('top', '-45px')
                        $(baseBlocks_excess).eq(index).css('height', `55px`);
                        $(baseBlocks_excess).eq(index).find('.reinsurance--block--value').text(`- ${formatLargeNumber(captivePayouts_array_above_max[index])}`)
                    }

                    if (aggPayouts_array[index] > 0) {
                        $(aggBlocks).eq(index).css('display', 'flex')
                        $(aggBlocks).eq(index).css('height', `${(captivePayouts_array[index] + aggPayouts_array[index]) * usdPixelUnit_y}px`);
                        $(aggBlocks).eq(index).css('width', `${aggCheckpointWidth}px`);

                        if (index > aggCheckpoint) {

                            aggCheckpointWidth = 84
                            $(aggBlocks).eq(index).css('width', `${aggCheckpointWidth}`);
                            $(element).remove()
                        } else if (index === aggCheckpoint && aggPayouts_array[index] !== xol_ap && captivePayouts_array[index] !== 0) {
                            $(aggBlocks).eq(index).css('font-size', `10px`);
                            $(aggBlocks).eq(index).css('border-top-left-radius', `0px`);
                            $(element).css('font-size', `10px`);
                            $(element).find('.reinsurance--block--value').css('position', `absolute`);
                            $(element).find('.reinsurance--block--value').css('left', `2px`);
                            aggCheckpointWidth = 42
                            $(aggBlocks).eq(index).css('width', `${aggCheckpointWidth}`);
                            relativePosition = 84 + aggCheckpoint * 84 + aggCheckpoint * (8) - 42
                        } else if (index === aggCheckpoint && captivePayouts_array[index] === 0) {

                            aggCheckpointWidth = 84
                            $(aggBlocks).eq(index).css('width', `${aggCheckpointWidth}`);
                            $(element).remove()
                            relativePosition = 84 + aggCheckpoint * 84 + aggCheckpoint * (8) - 88
                        }
                        $(aggBlocks).eq(index).find('.reinsurance--block--value').text(formatLargeNumber(aggPayouts_array[index]))
                    }
                }

                if (index !== aggCheckpoint && index < aggCheckpoint) {
                    let progress = totalLoss / agg_ap; // Calculate how close totalLoss is to agg_ap
                    progress = Math.min(Math.max(progress, 0), 1); // Ensure progress stays between 0 and 1

                    const maxOffset = 160; // The offset when totalLoss is far from agg_ap
                    const minOffset = 4; // The offset when totalLoss is close to agg_ap

                    relativePosition = 84 + index * 84 + index * 8 + (maxOffset - progress * (maxOffset - minOffset));
                }

            });


            dotPosition(dotAggAp, 9, relativePosition)
            dotPosition(aggLine, 0, relativePosition)
            dotAggAp.css('display', 'flex')
            aggLine.show()


            if ($('.reinsurance--graph--block.base').length === 0) return;
            linesStyle(true, true)
            dotPosition(dotAggAp, - 64, dotAggAp.css('left'))

        } else if (isXolActive && !isAggActive && isQuotaActive) {
            dotMaxLimit.css('display', 'flex')
            dotXolAp.css('display', 'flex')
            sideLabelAp.css('display', 'flex')
            sideLabelMax.css('display', 'flex')
            sideLabelAp.html(`${formatLargeNumber(xol_ap)}<br>Quota AP`);


            const baseBlocks = $('.reinsurance--graph--block.base')
            const baseBlocks_excess = $('.reinsurance--graph--block.base-excess')
            const xolBlocks = $('.reinsurance--graph--block.xol')
            const quotaBlocks = $('.reinsurance--graph--block.quota')

            //console log all arrays


            baseBlocks.each((index, element) => {
                let currentLoss = parseToNumber($('.reinsurance--slider--card.loss').find('.reinsurance--input').eq(index).val());


                if (currentLoss === 0) {
                    $(element).remove()
                } else {
                    $(element).css('display', 'flex');
                    $(element).css('height', `${(captivePayouts_array[index] + quotaPayouts_array[index]) * usdPixelUnit_y}px`);
                    console.log($(element).height())
                    $(element).find('.reinsurance--block--value').text(`- ${formatLargeNumber(captivePayouts_array[index])}`)
                    $(element).find('.reinsurance--block--value').css('position', 'absolute')
                    $(element).find('.reinsurance--block--value').css('top', `${captivePayouts_array[index] * usdPixelUnit_y * 0.5 - 4}px`)


                    $(quotaBlocks).eq(index).css('display', 'flex')
                    $(quotaBlocks).eq(index).css('height', `${(quotaPayouts_array[index] + captivePayouts_array[index]) * usdPixelUnit_y * insurer_percentage}px`);
                    $(quotaBlocks).eq(index).find('.reinsurance--block--value').text(formatLargeNumber(quotaPayouts_array[index]))



                    if (xolPayouts_array[index] > 0) {
                        $(xolBlocks).eq(index).css('display', 'flex')
                        $(xolBlocks).eq(index).css('height', `${(xolPayouts_array[index] + captivePayouts_array[index] + quotaPayouts_array[index]) * usdPixelUnit_y}px`);
                        $(xolBlocks).eq(index).find('.reinsurance--block--value').text(formatLargeNumber(xolPayouts_array[index]))
                        $(xolBlocks).eq(index).find('.reinsurance--block--value').css('position', 'absolute')
                        $(xolBlocks).eq(index).find('.reinsurance--block--value').css('top', `${xolPayouts_array[index] * usdPixelUnit_y * 0.5 - 6}px`)
                    }

                    if (captivePayouts_array_above_max[index] > 0) {

                        $(baseBlocks_excess).eq(index).css('display', 'flex')
                        $(baseBlocks_excess).eq(index).css('top', '-45px')
                        $(baseBlocks_excess).eq(index).css('height', `55px`);
                        $(baseBlocks_excess).eq(index).find('.reinsurance--block--value').text(`- ${formatLargeNumber(captivePayouts_array_above_max[index])}`)
                    }
                }


            });

            $('.reinsurance--graph--block.base').each((index, element) => {
                if ($(element).height() < 80) {
                    console.log('less than 80')
                    $(element).css('height', '80px')
                    $(element).siblings('.quota').css('height', `${80 * insurer_percentage}px`)
                    $(element).find('.reinsurance--block--value').css('position', 'absolute')
                    $(element).find('.reinsurance--block--value').css('top', `${(80 * usdPixelUnit_y * insurer_percentage * 0.5 - 16) * -1}px`)
                }

            });


            if ($('.reinsurance--graph--block.base').length === 0) return;
            linesStyle(true)
        }


        //any reinusurance block with less than 50px height gets 50px height
        $('.reinsurance--graph--block').each((index, element) => {
            if ($(element).height() < 30) $(element).css('height', '30px')
        });
    };

    let aggPayouts_array = []
    let xolPayouts_array = []
    let captivePayouts_array = []
    let captivePayouts_array_above_max = []
    let quotaPayouts_array = []
    let aggCheckpointWidth = 0
    let aggCheckpoint = -1

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
        aggPayouts_array = []
        xolPayouts_array = []
        captivePayouts_array = []
        captivePayouts_array_above_max = []
        quotaPayouts_array = []
        aggCheckpointWidth = 0
        aggCheckpoint = -1


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

                if (currentLoss <= XoL_AP) {
                    // No payout, just subtract the loss from the balance
                    current_xol_payout = 0
                    newBalance = newBalance - currentLoss;

                    captivePayouts_array.push(currentLoss)
                    captivePayouts_array_above_max.push(0)
                } else if (currentLoss > XoL_MaxLimit) {
                    // Loss exceeds AP and Max Limit, full payout up to Max Limit
                    XoL_Payout = XoL_Payout + (XoL_MaxLimit - XoL_AP);
                    current_xol_payout = XoL_MaxLimit - XoL_AP
                    newBalance = newBalance - (currentLoss - current_xol_payout);
                    captivePayouts_array.push((XoL_AP))
                    captivePayouts_array_above_max.push(currentLoss - XoL_MaxLimit)
                } else {
                    // Loss exceeds AP but within Max Limit, payout up to Loss - AP
                    let captive_payout = currentLoss - XoL_AP;
                    XoL_Payout = XoL_Payout + captive_payout;
                    newBalance = newBalance - XoL_AP
                    current_xol_payout = currentLoss - XoL_AP
                    captivePayouts_array.push(XoL_AP)
                    captivePayouts_array_above_max.push(0)
                }

                xolPayouts_array.push(current_xol_payout)
            });

            // Display the new balance and XoL Payout using the formatting utility
            cardBalance.text(formatToDollar(newBalance));
            cardXolPayout.text(formatToDollar(XoL_Payout));


        } else if (isXolActive && isAggActive && !isQuotaActive) {
            console.log('xol + agg');

            let agg_current_payout = 0
            let agg_total_payout = 0

            let howMuchLeftToAgg = agg_AP




            $('.reinsurance--slider--card.loss').find('.reinsurance--input').each((index, element) => {
                let currentLoss = parseToNumber($(element).val());
                previousLosses = totalLoss;
                totalLoss = totalLoss + currentLoss; // Accumulate the losses

                //getting current_xol_payout
                if (currentLoss <= XoL_AP) {
                    current_xol_payout = 0
                } else if (currentLoss > XoL_MaxLimit) {
                    current_xol_payout = XoL_MaxLimit - XoL_AP
                } else {
                    current_xol_payout = currentLoss - XoL_AP
                }


                if (totalLoss <= agg_AP) {
                    agg_current_payout = 0
                    howMuchLeftToAgg = agg_AP - totalLoss
                } else {

                    if (index === 0) { // the first loss has reached agg

                        if (agg_AP > XoL_AP) {
                            agg_current_payout = 0
                        } else if (agg_AP < XoL_AP) {
                            agg_current_payout = currentLoss - agg_AP - current_xol_payout
                            if (currentLoss > XoL_MaxLimit) agg_current_payout = XoL_MaxLimit - agg_AP - current_xol_payout
                        } else if (agg_AP === XoL_AP) {
                            agg_current_payout = 0

                        }

                        aggCheckpoint = -2

                    } else {
                        if (aggCheckpoint === -1) aggCheckpoint = index

                        if (aggCheckpoint === index) {
                            if (currentLoss > XoL_AP) {
                                agg_and_captive_payout = XoL_AP //Q2 + Q4
                                //console.log('agg_and_captive_payout', agg_and_captive_payout)
                                let Q2 = howMuchLeftToAgg
                                let Q4 = XoL_AP - Q2
                                if (Q4 === 0) Q4 = XoL_AP

                                agg_current_payout = Q4

                            } else {
                                let Q2 = currentLoss - totalLoss + agg_AP
                                if (Q2 === 0) Q2 = currentLoss
                                agg_current_payout = Q2


                            }
                        } else { // every loss after checkpoint loss
                            console.log('here', index)
                            if (currentLoss > XoL_AP) {
                                agg_current_payout = XoL_AP
                            } else {
                                agg_current_payout = currentLoss
                            }
                        }
                    }
                }

                newBalance = newBalance - (currentLoss - (current_xol_payout + agg_current_payout))
                XoL_Payout = XoL_Payout + current_xol_payout
                agg_total_payout = agg_total_payout + agg_current_payout
                aggPayouts_array.push(agg_current_payout)
                xolPayouts_array.push(current_xol_payout)

                if (currentLoss > XoL_MaxLimit) {
                    captivePayouts_array_above_max.push(currentLoss - XoL_MaxLimit)
                    captivePayouts_array.push(XoL_AP - agg_current_payout)
                } else {
                    captivePayouts_array_above_max.push(0)
                    captivePayouts_array.push(currentLoss - (current_xol_payout + agg_current_payout))
                }

                aggCheckpointWidth = howMuchLeftToAgg / agg_AP * 84

            });


            //progress bar
            $('#agg-bar--text').closest('.agg-bar').css('display', 'flex')
            $('#agg-bar--text').text(`${formatLargeNumber(howMuchLeftToAgg)} of ${formatLargeNumber(agg_AP)}`)
            $('.agg-bar--progress').css('width', `${howMuchLeftToAgg / agg_AP * 100}%`)


            console.log('captivePayouts_array', captivePayouts_array)
            console.log('xolPayouts_array', xolPayouts_array)
            console.log('aggPayouts_array', aggPayouts_array)
            console.log('-----------')

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

                if (currentLoss <= XoL_AP) {
                    // No payout, just subtract the loss from the balance
                    currentQuota_payout = currentLoss * insured_percentage
                    newBalance = newBalance - currentLoss * insurer_percentage;

                    captivePayouts_array.push(currentLoss * insurer_percentage)
                    captivePayouts_array_above_max.push(0)
                    quotaPayouts_array.push(currentLoss * insured_percentage)
                    xolPayouts_array.push(0)
                } else if (currentLoss > XoL_MaxLimit) {
                    // Loss exceeds AP and Max Limit, full payout up to Max Limit
                    XoL_Payout = XoL_Payout + (XoL_MaxLimit - XoL_AP);
                    currentQuota_payout = XoL_AP * insured_percentage
                    newBalance = newBalance - XoL_AP * insurer_percentage;

                    captivePayouts_array.push(XoL_AP * insurer_percentage)
                    captivePayouts_array_above_max.push(currentLoss - XoL_MaxLimit)
                    quotaPayouts_array.push(XoL_AP * insured_percentage)
                    xolPayouts_array.push(XoL_MaxLimit - XoL_AP)
                } else {
                    // Loss exceeds AP but within Max Limit, payout up to Loss - AP
                    current_xol_payout = currentLoss - XoL_AP;
                    XoL_Payout += current_xol_payout;
                    currentQuota_payout = XoL_AP * insured_percentage
                    newBalance = newBalance - XoL_AP * insurer_percentage

                    captivePayouts_array.push(XoL_AP * insurer_percentage)
                    captivePayouts_array_above_max.push(0)
                    quotaPayouts_array.push(XoL_AP * insured_percentage)
                    xolPayouts_array.push(current_xol_payout)
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

        renderGraph(isXolActive, isAggActive, isQuotaActive, XoL_MaxLimit, XoL_AP, agg_AP, insured_percentage, insurer_percentage, aggCheckpointWidth)

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
        controller.calculateLoss();
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
    $('#agg-ap').val('$200,000')
    $('#xol-ml').val('$1,000,000')
    $('#initialLoss').val('$100,000')
    $('#quota-share--reinsurer').val('50%')
    $('#quota-share--responsibility').val('50%')
    $('#agg-bar--text').parent().parent().hide()
    $('.agg-bar--progress').css('width', `0%`)

    // graph start
    $('#dot--agg-ap').hide()
    $('.reinsurance--agg-line').hide()
    $('#dot--ap').hide()
    $('#dot--max-limit').hide()

    //open loss card
    $('.reinsurance--card--header').eq(1).trigger('click')
    //calculate
    $('.reinsurance--apply--button').eq(0).trigger('click')

    $('form').on('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            $('.reinsurance--apply--button').eq(0).trigger('click')
        }
    });



});