# Masked Input

Use the "0" or "#" or "_" as a marker on where input must go.
"0" for numeric only input.
"#" alpha or numeric input.  
"_" for alpha only input.

The cursor only follows the markers, all other characters are as they are defined.  
Thus spaces stay spaces and brackets stay brackets.  
The cursor follows the markers.  
In cases where you want to extend the input until finished, use the "*" marker.

```html
<input type="phone" is="masked-input" data-mask="(000) 00 00000">
<input type="duration" is="masked-input" data-mask="000 : 00 : 00 : 00">
```

The email example shows that you have text input continuously before and after the "@".  
Use the tab key to jump from the left to the right when using *