
$('.updataBtn').click(function(){
    $('.updata').css('display','block');
    console.log($(this).parent().parent().html());
    $('.updata form ._id').val($(this).parent().parent().find('td').eq(0).html());
    $('.updata form .username').val($(this).parent().parent().find('td').eq(1).html());
    $('.updata form .nickname').val($(this).parent().parent().find('td').eq(2).html());
    $('.updata form .age').val($(this).parent().parent().find('td').eq(3).html());
    $('.updata form .sex').val($(this).parent().parent().find('td').eq(4).html());
    $('.updata form .phone').val($(this).parent().parent().find('td').eq(5).html());
});
$('span.submit').click(function(){
    $('.updata').css('display','none');
});
$('.user').css('background','skyblue');
$(document).ready(function(){
    var index=location.href.split('&')[0].split('=')[1]-1;
    console.log('index'+index);
    $('.page li').eq(index).css('background','skyblue').siblings().css('background','#ccc');
});
