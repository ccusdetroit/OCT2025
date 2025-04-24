document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('rsvpForm');
    const formMessage = document.getElementById('form-message');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Scroll to the form message area
            const submitButton = document.querySelector('button[type="submit"]');
            submitButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Show loading message
            formMessage.innerHTML = '<p class="loading">Submitting your RSVP...</p>';
            formMessage.style.display = 'block';
            
            // Get form data
            const formData = new FormData(form);
            
            // Convert checkboxes that aren't checked to "No"
            if (!formData.has('Service_Music_Rehearsal')) formData.append('Service_Music_Rehearsal', 'No');
            if (!formData.has('Service_Seeking_Gifts')) formData.append('Service_Seeking_Gifts', 'No');
            if (!formData.has('Service_Youth_Meeting')) formData.append('Service_Youth_Meeting', 'No');
            
            // Add timestamp
            formData.append('Timestamp', new Date().toISOString());
            
            // Create an object from FormData for better debugging
            const formDataObj = {};
            formData.forEach((value, key) => {
                formDataObj[key] = value;
            });
            
            // Convert FormData to URL params
            const data = [...formData.entries()];
            const asString = data
                .map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`)
                .join('&');
            
            // Google Sheet script URL - Updated with the user's script URL
            const scriptURL = 'https://script.google.com/macros/s/AKfycbxqKhRaUJ9FqDHXIF-TUcaKJpWz_3BgH1ytJx9UPfFnG4dcdteceFiI7G3U1KEv_3_ynQ/exec';
            
            // Create a new XMLHttpRequest
            const xhr = new XMLHttpRequest();
            xhr.open('POST', scriptURL);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            
            // Define what happens on successful data submission
            xhr.onload = function() {
                if (xhr.status === 200) {
                    // Show success message
                    formMessage.innerHTML = '<p class="success">Thank you! Your RSVP has been submitted successfully.</p>';
                    
                    // Reset form
                    form.reset();
                    
                    // Hide success message after 8 seconds
                    setTimeout(() => {
                        formMessage.style.display = 'none';
                    }, 8000);
                } else {
                    // Show error message
                    formMessage.innerHTML = '<p class="error">There was an error submitting your RSVP. Please try again or contact us directly.</p>';
                    console.error('Error with status code:', xhr.status);
                }
            };
            
            // Define what happens in case of error
            xhr.onerror = function() {
                // Show error message
                formMessage.innerHTML = '<p class="error">There was an error submitting your RSVP. Please try again or contact us directly.</p>';
                console.error('Request failed');
                
                // For debugging - try alternative approach with fetch as backup
                tryFetchAsBackup(scriptURL, asString, formMessage, form);
            };
            
            // Send the request
            xhr.send(asString);
        });
    }
    
    // Backup function using fetch API
    function tryFetchAsBackup(scriptURL, asString, formMessage, form) {
        console.log('Trying fetch as backup...');
        
        fetch(scriptURL, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: asString
        })
        .then(response => {
            console.log('Fetch backup response:', response);
            if (response.ok) {
                formMessage.innerHTML = '<p class="success">Thank you! Your RSVP has been submitted successfully.</p>';
                form.reset();
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .catch(error => {
            console.error('Fetch backup error:', error);
        });
    }
});
