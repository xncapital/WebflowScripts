
jQuery(document).ready(function($) {
    // Hide all popups initially
    $('.services-process--popup').hide();

    $('.services-process--dash-button').click(function() {
        // Hide any currently visible popups
        $('.services-process--popup').hide();

        // Show the popup associated with this button.
        // Since the popup is now a sibling to the button inside the same wrapper, we navigate to the parent first
        // and then find the popup within that parent.
        $(this).closest('.services-process--dash-button-wrapper').find('.services-process--popup').show();
    });
    
    $('.services-process--icon').click(function(e) {
        e.stopPropagation(); // Prevent the click from bubbling up to the .services-process--dash-button
       
        $(this).closest('.services-process--dash-button').siblings('.services-process--popup').hide();
    });

    // Optional: Close popup when the close button is clicked
    $('.services-process--popup-close-button').click(function(e) {
        e.stopPropagation(); // Prevent the click from bubbling up to the .services-process--dash-button
         $(this).closest('.services-process--popup').hide();
    });
});
