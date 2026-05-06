A new Recharts spending chart was added to the Overview page. 
I want the following changes:

1. On desktop (md: breakpoint and above): keep the new Recharts 
   chart exactly as it is. Do not touch it.

2. On mobile (below md: breakpoint): hide the new Recharts chart 
   completely using Tailwind's hidden class with md:block — so it 
   shows on desktop only.

3. Find the original static/design chart that existed in the 
   Overview page before the Recharts chart was added. It likely 
   exists in the .design-tmp folder or was part of the original 
   Claude Design export. Restore it for mobile only, wrapped in 
   a div that shows on mobile and hides on desktop (block md:hidden).

4. Wrap that restored mobile chart in a horizontally scrollable 
   container with these exact properties:
   overflow-x: scroll
   -webkit-overflow-scrolling: touch  
   touch-action: pan-x
   And give the inner chart container a fixed width of 600px so 
   the full chart is accessible by swiping.

If the original static chart cannot be found or restored cleanly, 
then instead just hide the new Recharts chart on mobile entirely 
using hidden md:block, and leave mobile without a chart for now. 
Do not create anything new.

Do not change any other component. Desktop must remain exactly 
as it currently looks.