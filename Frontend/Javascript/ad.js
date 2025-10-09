Array('/Media/banner1.jpg','/Media/banner2.jpg','/Media/banner3.jpg')
banner=0

function ShowBanners()
{ if (document.images)
{ banner++
if (banner==MyBanners.length) {
banner=0}
document.ChangeBanner.src=MyBanners[banner]
setTimeout("ShowBanners()",5000)
}
}