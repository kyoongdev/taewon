/**
 * @brief   input time 생성
 * @author  김정근
 * @date    2021-09-16
 */
class Time {

    make(selector) {

        //node make start
        $(selector).append(
            `<div class="time_warpper"> 
                <div class="hour">
                    <input type="text" name="hour" min="1" max="12" maxlength="2" oninput="this.value = this.value.replace(/[^0-9]/g, '');" />
                    <span>:</span>
                </div>
                <div class="minute">
                    <input type="text" name="minute" min="0" max="59" maxlength="2" oninput="this.value = this.value.replace(/[^0-9]/g, '');" />
                </div>
                <div class="ampm">
                    <input type="text" name="ampm" readonly />
                    <button class="time_btn"><img src=""/></button>
                </div>
                <div class="time_inner">
                    <div class="inner_hour" data-name="hour">

                    </div>

                    <div class="inner_minute" data-name="minute">
                    
                    </div>
                    <div class="inner_ampm" data-name="ampm">

                    </div>
                </div>
            </div>`
        );

        var date = new Date();
        
        this._setHour(date);
        this._setMinute(date);
        this._setAmPm(date);
       

        $('.time_inner').hide();
        //node make end

        //value setting start 
        $('input[name=hour]').val('--');
        $('input[name=minute]').val('--');
        $('input[name=ampm]').val('--');
        //value setting end


        //event binding start
        $(document).on('click','.inner_hour > p, .inner_minute > p, .inner_ampm > p',this._selectVal);
        $('.inner_hour, .inner_minute').bind('scroll', this._scroll);

        //inner toggle start
        $('.time_btn').unbind('click');
        $('.time_btn').bind('click', function() {
            for(var i = $('.time_inner').length -1; i>=0; i--) {
                if($('.time_inner').eq(i).css('display') == 'block' && $('.time_btn').index(this) != i) {
                    $('.time_inner').eq(i).hide();
                }
            }
            console.log(1);
            $(this).closest('.time_warpper').find('.time_inner').toggle();
        });

        $('div').bind('click', function(e) {
            console.log($(e.target).attr('class'));
            if($(e.target).attr('class') === 'time_btn') {
                
                return false;
            }

            if(!$('.time_inner').has(e.target).length) {
                $('.time_inner').hide();
            }
        });
        //inner toggle end

        $('input[name=hour], input[name=minute], input[name=ampm]').bind('keyup', function() {
            var inputType = $(this).attr('name');

            switch(inputType) {
                case 'hour':
                    if($(this).val() === '00' || $(this).val() > 12) {
                        $(this).val('12');
                    }
                    break;
                case 'minute':
                    if($(this).val() > 59) {
                        $(this).val('59');
                    }
                    break;
                case 'ampm':
                    break;
                default:
                    break;
            }
        }) ;      
        
        //text all select
        $('input[name=hour], input[name=minute]').bind('click', function() {
            $(this).select();
        });
        

        //text value defaulte
        $('input[name=hour], input[name=minute]').bind('change', function() {
            if($(this).val() == "") {
                $(this).val("--");
            }
        });

        //event binding end
    }


    //click value
    _selectVal() {
        var $innerDiv = $(this).parent('div');
        var $timeWarpper = $innerDiv.closest('.time_warpper');

        if($innerDiv.data('name') === 'hour') {
            $timeWarpper.find('input[name=hour]').val($(this).text());
        } else if($innerDiv.data('name') === 'minute') {
            $timeWarpper.find('input[name=minute]').val($(this).text());
        } else if($innerDiv.data('name') === 'ampm') {
            $timeWarpper.find('input[name=ampm]').val($(this).text());
        }

        $innerDiv.find('.select').removeClass('select');
        $(this).addClass('select');
    }

    //inner scroll start
    _scroll() {
        var temp = [];
        var className = $(this).attr('class').split('_');
        className = className[1];

        //scroll down start
        if($(this)[0].scrollHeight - $(this).scrollTop() == $(this).closest('.time_inner').outerHeight()) {
            for(var i = 0; i <= $(this).find('p').length -1 ; i++) {
                if($(this).find('p').eq(i).position().top < 0) {
                    temp.push($(this).find('p').eq(i).text());
                }
            }
            var $temp = $(this);

            $.each(temp, function(index, item) {
                var selectClass = $(`.${className}_${item}`).attr('class').split(' ');
                selectClass = selectClass[1];

                if(selectClass === 'select') {
                    $temp.find(`.${className}_${item}`).remove();
                    $temp.append(`<p class="${className}_${item} select">${item}</p>`);
                } else {
                    $temp.find(`.${className}_${item}`).remove();
                    $temp.append(`<p class="${className}_${item}">${item}</p>`);
                }
            });

            temp =[];
            $(this).scrollTop(1);
        }
        //scroll down end
        
        // scroll Up
        if($(this).scrollTop() == 0) {
            for(var i = $(this).find('p').length -1; i >= 0; i--) {
                if($(this).find('p').eq(i).position().top > 260) {
                    temp.push($(this).find('p').eq(i).text());
                }
            }
            var $temp = $(this);

            $.each(temp, function(index, item) {
                var selectClass = $(`.${className}_${item}`).attr('class').split(' ');
                selectClass = selectClass[1];

                if(selectClass === 'select') {
                    $temp.find(`.${className}_${item}`).remove();
                    $temp.prepend(`<p class="${className}_${item} select">${item}</p>`);
                } else {
                    $temp.find(`.${className}_${item}`).remove();
                    $temp.prepend(`<p class="${className}_${item}">${item}</p>`);
                }
            });

            if(className === 'hour') {
                $(this).scrollTop(280);
            } else if(className ==='minute') {
               $(this).scrollTop(2630);
            }
            temp = [];
        }
        //scroll up end
    }

    _setHour(date) {
        var hour = (date.getHours() % 12) || 12;
        var hours = [];
        var prehour = ((date.getHours() - 5) % 12) || 12;
       
        for(var i = 0; i <= 4; i++) {
            hours.push(prehour);
            prehour++;

            if(prehour > 12) {
                prehour = 1;
            }
        }
        
        while(hours.length < 12) {
            if(hour > 12) {
                hour = 1;
            }
            if(hour <= 12) {
                hours.push(hour);
            }
            hour++;
        }
        
        for(var i=0; i<=11; i++) {
            $('.inner_hour').append(`<p class="hour_${hours[i]}">${hours[i]}</p>`);
        }

        hour = (date.getHours() % 12) || 12;

        $(`.hour_${hour}`).addClass('select');
        $('.inner_hour').scrollTop(1);
    }


    _setMinute(date) {
        var minute = date.getMinutes();
        var minutes = [];
        var preminute = (minute - 5 < 0) ? 60 + (minute - 5) : minute - 5; 
        
        for(var i = 0; i <= 4; i++) {
            minutes.push(preminute);
            preminute++;

            if(preminute > 59) {
                preminute = 0;
            }
        }

        while(minutes.length < 60) {
            if(minute > 59) {
                minute = 0;
            }
            if(minute <= 59) {
                minutes.push(minute);
            }
            minute++;
        }
        
        for(var i=0; i<=59; i++) {
            $('.inner_minute').append(`<p class="minute_${minutes[i]}">${minutes[i]}</p>`);
        }

        minute = date.getMinutes();
        
        $(`.minute_${minute}`).addClass('select');
        $('.inner_minute').scrollTop(1);

    }

    _setAmPm(date) {
        var time = date.getHours();

        if(time > 12) {
            $('.inner_ampm').append(`<p class="pm select">오후</p>`);
            $('.inner_ampm').append(`<p class="am">오전</p>`);
        } else {
            $('.inner_ampm').append(`<p class="pm">오후</p>`);
            $('.inner_ampm').append(`<p class="am select">오전</p>`);
        }
    }
}
