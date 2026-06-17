# seed_12_blogs.ps1
$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json; charset=utf-8"
}

$blogs = @(
    @{
        id = "1"
        slug = "how-to-design-book-covers-that-sell"
        title = "How to Design Book Covers That Sell: Bestseller Secrets"
        summary = "Discover the core principles of professional book cover design. Learn how to choose the right colors, typography, and visual hooks to double your sales on Amazon KDP."
        content = "<h2>Why Book Cover Design Matters for Self-Publishing</h2><p>In the competitive world of Amazon KDP publishing, your book cover is the single most important marketing asset. Professional book cover design is not just about aesthetics; it is about communication, genre alignment, and capturing a reader's attention in a fraction of a second.</p><p>Loufy Publishing Services helps authors align their design with reader expectations, which is essential to drive clicks and boost sales on Amazon KDP.</p><h3>1. Genre Alignment and Expectation</h3><p>Every genre has its own design language. A thriller requires high contrast, mystery elements, and dark tones, while a romance needs soft gradients, warm colors, and elegant fonts. Designing outside these genre bounds can confuse readers and hurt conversion rates.</p><h3>2. High-Contrast Typography</h3><p>Your cover text must be easily readable even at thumbnail sizes in search results. Choose bold, readable fonts and ensure adequate contrast between the background and text. Never use faint or thin fonts for title text on a busy background.</p><h3>3. The Hierarchy of Information</h3><p>A bestselling book cover has a clear visual hierarchy. First, the reader should see the focal graphic hook, then the title, and lastly, the author's name and subtitle. When these elements compete for attention, the design feels chaotic and unprofessional.</p>"
        image_url = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&fit=crop"
        category = "Book Cover Design"
        tags = @("Book Cover Design", "Self Publishing Services", "Author Services", "Loufy Publisher")
        author_name = "Loufy Publisher"
        published_at = "2026-06-11T09:00:00Z"
        read_time = 5
        is_featured = $true
        seo_title = "How to Design Book Covers That Sell | Loufy Publisher"
        seo_description = "Learn how to design book covers that sell on Amazon KDP. Discover book cover design principles, typography, and self-publishing secrets from Hamid Raza."
        faqs = @(
            @{
                question = "What file formats do you deliver for book cover design?"
                answer = "We deliver print-ready PDF files for paperback/hardcover covers and JPEG/TIFF formats for Kindle eBooks, plus fully editable Photoshop source files."
            },
            @{
                question = "Can you redesign my existing KDP book cover?"
                answer = "Yes, we specialize in book cover redesigns to modernize styling and boost KDP sales."
            }
        )
    },
    @{
        id = "2"
        slug = "amazon-kdp-publishing-guide"
        title = "Amazon KDP Publishing: Step-by-Step Guide for Self-Publishers"
        summary = "Master Amazon KDP publishing. Explore expert tips for Kindle formatting, paperback layout design, and keywords to rank higher in Amazon search results."
        content = "<h2>An Author's Guide to Amazon KDP Publishing</h2><p>Self-publishing has democratized the book industry, and Amazon KDP Publishing is at the forefront. But publishing a book takes more than just uploading a Word document. To stand out, professional book formatting and formatting checks are critical.</p><p>Using professional book publishing services ensures your interior layout looks premium on every device.</p><h3>1. The Core of Book Formatting</h3><p>For Kindle formatting, reflowable layouts are key so readers can adjust font sizes. For paperback formatting and hardcover formatting, fixed page layouts with proper margins, bleed settings, and gutter sizes are required. Proper margin alignment prevents text from getting cut off during printing.</p><h3>2. Keyword Research and Meta Optimization</h3><p>To rank higher in Amazon searches, you must perform deep keyword research. Put relevant search phrases in your book title, subtitle, description, and the backend KDP keyword fields. Focus on search phrases that have high search volume but low competition.</p><h3>3. The Importance of a Professional Layout</h3><p>Unformatted books often get negative reviews because of layout errors, inconsistent fonts, or overlapping images. Loufy KDP Publishing services resolves this by auditing every page before release, ensuring clean headings and consistent typography.</p>"
        image_url = "https://images.unsplash.com/photo-1553729459-afe8f2e2882d?w=800&fit=crop"
        category = "KDP Publishing"
        tags = @("Amazon KDP Publishing", "Book Formatting", "Kindle Formatting", "Paperback Formatting")
        author_name = "Hamid Raza (KDP Expert)"
        published_at = "2026-06-12T10:00:00Z"
        read_time = 6
        is_featured = $false
        seo_title = "Amazon KDP Publishing Guide for Self-Publishers | Loufy Publisher"
        seo_description = "Master Amazon KDP publishing. Learn Kindle formatting, paperback layout margins, and keyword optimization to rank higher on Amazon."
        faqs = @(
            @{
                question = "What is the difference between eBook formatting and print formatting?"
                answer = "eBook formatting (Kindle formatting) uses reflowable HTML layouts, while print formatting (paperback/hardcover formatting) uses static PDF files with exact margins, headers, page numbers, and bleed configurations."
            },
            @{
                question = "Does Loufy Publisher manage the upload process on Amazon?"
                answer = "Yes, we provide guidance and support for the entire upload and publishing process on KDP."
            }
        )
    },
    @{
        id = "3"
        slug = "best-typography-children-book-formatting"
        title = "Best Typography and Layouts for Children's Book Formatting"
        summary = "Formatting children's coloring books or storybooks requires specialized skills. Learn the best layout practices, bleed parameters, and typography for children's publishing."
        content = "<h2>Understanding Children's Book Formatting</h2><p>Children's books are highly visual and require precise layout control. Unlike standard text novels, children's book formatting usually requires edge-to-edge images (bleed formatting) and clean text placement.</p><p>As a Hamid Raza KDP Expert, I have formatted hundreds of children coloring books and layout storybooks to the highest standards.</p><h3>1. Font Selection for Young Readers</h3><p>Use large, simple, sans-serif or slab-serif fonts (like Comic Neue, Montserrat, or Dyslexie) that are easy for young children to read. Ensure text sits on a solid high-contrast background rather than complex image details.</p><h3>2. Managing Bleed and Margins</h3><p>Because children's books typically contain full-bleed illustrations, you must design with bleed parameter in mind. Illustrations must extend by 0.125 inches beyond the page trim borders to ensure no white edges remain after cutting.</p><h3>3. Coloring Book Layout Details</h3><p>For children coloring books, it is crucial to use single-sided pages (blank backs) to prevent bleed-through from crayons or markers. Correct page padding and gutters ensure that the design stays centered even after binding.</p>"
        image_url = "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&fit=crop"
        category = "Book Formatting"
        tags = @("Children's Book Formatting", "Book Formatting", "Self Publishing Services", "Loufy Book Formatting")
        author_name = "Loufy Book Formatting"
        published_at = "2026-06-13T08:00:00Z"
        read_time = 4
        is_featured = $false
        seo_title = "Children's Book Formatting and Typography Secrets | Loufy Publisher"
        seo_description = "Learn how to format children coloring books and layout storybooks. Get tips on bleed margins and typography from Hamid Raza KDP Expert."
        faqs = @(
            @{
                question = "What is bleed in children's book formatting?"
                answer = "Bleed refers to page elements that extend beyond the trim edge of the page, ensuring no white borders remain after the book is printed and trimmed."
            }
        )
    },
    @{
        id = "4"
        slug = "book-formatting-hardcover-vs-paperback"
        title = "The Ultimate Guide to Book Formatting: Hardcover vs. Paperback"
        summary = "Understand the critical differences between hardcover and paperback layouts. Learn margins, gutter, spine, and file specs for print-on-demand books."
        content = "<h2>Hardcover vs. Paperback Formatting Requirements</h2><p>Print formatting is a precise art. When setting up files for Amazon KDP, you must decide between hardcover formatting and paperback formatting early on. The layout specifications, margins, and page requirements are completely different for each.</p><p>Loufy Book Formatting services provides authors with exact print-ready layouts tailored for both print options.</p><h3>1. Margin and Gutter Configurations</h3><p>Paperbacks are more flexible, while hardcovers have thicker bindings. Hardcovers require a slightly larger gutter size (the inner margin next to the spine) to ensure no text slips into the binding. Typically, paperbacks require a 0.5-inch inner margin, whereas hardcovers require 0.625 inches or more.</p><h3>2. Spine Thickness Calculations</h3><p>The spine size of your cover depends entirely on your final formatted page count. If your interior layout is not finalized, your cover designer cannot calculate the spine width correctly. Every single page added to the interior layout increases the spine by fractions of an inch.</p><h3>3. Premium Layout Touches</h3><p>Bestselling print books use customized page headers (author name on left pages, book title on right pages) and centered page numbers on the footer. We audit and formatting check these settings to ensure a professional look.</p>"
        image_url = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&fit=crop"
        category = "Book Formatting"
        tags = @("Book Formatting", "Paperback Formatting", "Hardcover Formatting", "Loufy Book Formatting")
        author_name = "Loufy Book Formatting"
        published_at = "2026-06-14T09:00:00Z"
        read_time = 5
        is_featured = $false
        seo_title = "Book Formatting Guide: Hardcover vs Paperback Margins | Loufy Publisher"
        seo_description = "Compare hardcover formatting vs paperback formatting. Learn about spine calculations, margin setup, and gutter sizing for Amazon KDP."
        faqs = @(
            @{
                question = "Can I use the same interior PDF file for paperback and hardcover?"
                answer = "No. Hardcover trim sizes and margin specifications differ from paperbacks. You must create two separately formatted PDF interior files."
            }
        )
    },
    @{
        id = "5"
        slug = "kindle-formatting-checklist-ebook-errors"
        title = "Kindle Formatting Checklist: Avoid These 5 Crucial eBook Layout Errors"
        summary = "Ensure your eBook flows perfectly on all Kindle devices. Explore this quick checklist to fix fonts, spacing, lists, and table of contents coding."
        content = "<h2>Designing Flawless eBooks with Kindle Formatting</h2><p>Kindle formatting is reflowable, which means text layout changes depending on screen size and reader font preferences. This makes eBook formatting very different from static print PDF formatting.</p><p>Using professional self publishing services helps authors avoid common errors that lead to bad reader reviews.</p><h3>1. The Reflowable HTML Hierarchy</h3><p>Kindle eBooks are essentially styled HTML/EPUB files. If headings are not tagged properly (using H1, H2 tags), the Kindle navigation system will fail. Avoid manual spacing or line breaks to push text onto a new page; use page breaks instead.</p><h3>2. High-Resolution Responsive Images</h3><p>Images in eBooks must scale responsively. Cover images must be high-resolution (around 1600x2560 pixels) and interior graphics must be optimized to render clearly without bloating the file size.</p><h3>3. The Dynamic NCX Table of Contents</h3><p>Every professional eBook needs a logical, clickable Table of Contents. If your Kindle file lacks a dynamic TOC, readers cannot easily skip between chapters, leading to a frustrating reading experience.</p>"
        image_url = "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=800&fit=crop"
        category = "KDP Publishing"
        tags = @("Kindle Formatting", "Book Formatting", "Self Publishing Services", "Hamid Raza KDP Expert")
        author_name = "Hamid Raza (KDP Expert)"
        published_at = "2026-06-15T11:00:00Z"
        read_time = 5
        is_featured = $false
        seo_title = "Kindle Formatting Checklist: 5 Crucial eBook Layout Errors | Loufy Publisher"
        seo_description = "Follow our Kindle formatting checklist. Discover reflowable eBook layouts, image sizes, and dynamic table of contents tips from Hamid Raza."
        faqs = @(
            @{
                question = "What format does Amazon KDP require for eBooks?"
                answer = "KDP accepts EPUB, KPF, and DOCX formats. EPUB is the industry standard for reflowable layouts."
            }
        )
    },
    @{
        id = "6"
        slug = "self-publishing-checklist-kdp-bestseller"
        title = "Self-Publishing Checklist: From Manuscript to Amazon KDP Bestseller"
        summary = "A comprehensive checklist for independent authors. Master self-publishing services, layout margins, KDP launch parameters, and cover design."
        content = "<h2>Your Roadmap to Self-Publishing Success on KDP</h2><p>Self-publishing on Amazon KDP is an exciting journey, but it requires a solid strategy. To transform a draft manuscript into a bestselling book, every step of the publishing process must be executed carefully.</p><p>Loufy Publisher provides end-to-end author services to prepare your book files for a flawless launch.</p><h3>1. Professional Editing and Formatting</h3><p>Never skip professional proofreading. Once your text is polished, apply professional book formatting. A clean layout with standard fonts (such as Garamond or Minion Pro) makes the reading experience smooth and premium.</p><h3>2. A Cover That Stands Out</h3><p>Your book cover is your primary sales hook. Invest in professional book cover design that clearly matches genre conventions while standing out in thumbnails. Make sure your title and name are bold and legible.</p><h3>3. Metadata and Launch Keywords</h3><p>Choose your 7 backend KDP keywords carefully. Pick long-tail search terms that readers actually type into the search bar. Set up your author profile page on Amazon Author Central to build authority.</p>"
        image_url = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&fit=crop"
        category = "KDP Publishing"
        tags = @("Amazon KDP Publishing", "Self Publishing Services", "Book Cover Design", "Author Services")
        author_name = "Loufy Publisher"
        published_at = "2026-06-15T14:00:00Z"
        read_time = 6
        is_featured = $false
        seo_title = "Self-Publishing Checklist: Amazon KDP Launch | Loufy Publisher"
        seo_description = "Get the complete self-publishing checklist. Learn book cover design strategies, interior formatting, and metadata tips to launch on KDP."
        faqs = @(
            @{
                question = "How long does it take to publish a book on Amazon KDP?"
                answer = "Once uploaded, Kindle eBooks are usually live within 24-48 hours, and print editions are available within 72 hours."
            }
        )
    },
    @{
        id = "7"
        slug = "paperback-formatting-gutter-margins-trim"
        title = "Paperback Formatting Secrets: Gutter, Margins, and Trim Size Explained"
        summary = "Learn the essential layout specifications for paperback books. Calculate inner gutter margin sizes and avoid print bleed cutoff errors."
        content = "<h2>Understanding Paperback Formatting Specifications</h2><p>When formatting print books, the margin layout represents the foundation. Gutter, margin parameters, and trim sizes determine whether your paperback layout feels open and professional or cramped and hard to read.</p><p>Using professional book publishing services ensures your margins are compliant with KDP standards.</p><h3>1. Defining Trim Size</h3><p>Trim size refers to the physical size of your book pages. The most common trim size for novels is 6x9 inches or 5.5x8.5 inches. Smaller sizes are excellent for poetry or compact novels, while larger trim sizes suit text-heavy guides or coloring books.</p><h3>2. Margins and Gutter Widths</h3><p>Margins prevent text from getting too close to the trim edges. The gutter is the inner margin that compensates for the binding bend. If your page count is high, your gutter must be larger. For example, a 150-page book needs a 0.375-inch gutter, whereas a 400-page book requires 0.75 inches.</p><h3>3. Managing Bleed vs. No-Bleed</h3><p>If your images reach the very edges of the page, choose the 'Bleed' option in KDP. If your book contains only text and centered graphics, select 'No Bleed'. Incorrect bleed configurations can cause KDP to reject your file.</p>"
        image_url = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&fit=crop"
        category = "Book Formatting"
        tags = @("Paperback Formatting", "Book Formatting", "Loufy Publishing Services", "Book Publishing Services")
        author_name = "Loufy Publishing Services"
        published_at = "2026-06-16T09:00:00Z"
        read_time = 5
        is_featured = $false
        seo_title = "Paperback Formatting Secrets: Gutter & Margins Guide | Loufy Publisher"
        seo_description = "Discover paperback formatting margins. Learn to set gutter sizes, calculate bleed, and select trim sizes for Amazon KDP printing."
        faqs = @(
            @{
                question = "What is the gutter in print book formatting?"
                answer = "The gutter is the extra margin added to the inner edge of the page to compensate for binding, keeping text readable and centered."
            }
        )
    },
    @{
        id = "8"
        slug = "why-childrens-book-formatting-requires-bleed"
        title = "Why Children's Book Formatting Requires Special Bleed Settings"
        summary = "Children's books feature rich illustration layouts. Learn bleed parameters, resolution tricks, and color printing setups for children's publishing."
        content = "<h2>Layout Rules for Children's Book Formatting</h2><p>Children coloring books and illustrated storybooks require a completely different formatting approach than novels. Because illustrations span across pages, children's book formatting requires a deep understanding of full-bleed printing.</p><p>As a Loufy Book Formatting expert, I format children coloring books and layout storybooks to exact print specifications.</p><h3>1. Full-Bleed Illustration Layouts</h3><p>Bleed means that background colors and images extend beyond the cut line. To achieve bleed, your illustrations must be designed larger than the actual trim size (typically 0.125 inches larger on each outer side). If bleed is missing, white gaps will appear after cutting.</p><h3>2. Image Resolution and Text Contrast</h3><p>Every single graphic must be at least 300 DPI (dots per inch) to prevent blurry prints. In addition, place text on solid banners or high-contrast graphics so it remains easy to read. Faint text over colorful illustrations will confuse children.</p><h3>3. Single-Sided Page Formatting for Coloring Books</h3><p>For children coloring books, it is crucial to format pages single-sided (meaning a blank back for every design page). This prevents bleed-through when children use markers, preserving their artwork.</p>"
        image_url = "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&fit=crop"
        category = "Book Formatting"
        tags = @("Children's Book Formatting", "Book Formatting", "Loufy Book Formatting", "Book Publishing Services")
        author_name = "Loufy Book Formatting"
        published_at = "2026-06-16T12:00:00Z"
        read_time = 4
        is_featured = $false
        seo_title = "Children's Book Formatting: Bleed & Trim Guidelines | Loufy Publisher"
        seo_description = "Learn children's book formatting. Discover full-bleed parameters, illustration layouts, and image resolution secrets from Hamid Raza."
        faqs = @(
            @{
                question = "Why do KDP coloring books need bleed?"
                answer = "Coloring books contain designs that span the entire page. Bleed ensures no white borders are left after the pages are trimmed to size."
            }
        )
    },
    @{
        id = "9"
        slug = "book-cover-design-color-psychology"
        title = "Book Cover Design Aesthetics: Color Psychology to Attract Readers"
        summary = "Leverage color psychology to design a cover that clicks. Learn color contrast rules, genre alignment, and thumbnail optimization tips."
        content = "<h2>Color Psychology in Professional Book Cover Design</h2><p>A book cover is a silent salesman. Choosing the right colors for your cover design is a strategic choice. In self-publishing, colors trigger subconscious emotions in potential readers, influencing whether they click and buy.</p><p>Loufy Publisher helps authors design covers that align with these emotional cues to drive massive Amazon KDP sales.</p><h3>1. Genre Specific Color Coding</h3><p>Genres have strong color associations. Self-help books use bright greens and blues to convey growth and serenity. Suspense novels use high-contrast blacks, dark reds, and shadows to trigger mystery. Designing outside these rules will confuse readers.</p><h3>2. Contrast and Legibility in Thumbnails</h3><p>Most readers find books on mobile screens. Ensure your text color contrasts sharply with the background (e.g. bright gold text on a dark green backdrop). If the title blends into the background, the thumbnail becomes invisible in search results.</p><h3>3. Visual Accents and Focal Hooks</h3><p>Use a single, vibrant accent color to guide the reader's eye to your primary focal point. Whether it is a bright orange book title or a glowing graphic hook, focal accents keep the layout balanced and compelling.</p>"
        image_url = "https://images.unsplash.com/photo-1513001900722-370f803f498d?w=800&fit=crop"
        category = "Book Cover Design"
        tags = @("Book Cover Design", "Author Services", "Loufy Publisher", "Self Publishing Services")
        author_name = "Loufy Publisher"
        published_at = "2026-06-16T15:00:00Z"
        read_time = 5
        is_featured = $false
        seo_title = "Book Cover Design: Color Psychology Secrets | Loufy Publisher"
        seo_description = "Learn color psychology in book cover design. Discover how to choose colors, maximize thumbnail contrast, and increase KDP click rates."
        faqs = @(
            @{
                question = "How many colors should I use on my book cover?"
                answer = "It is best to limit your color scheme to 2 or 3 primary colors with 1 vivid accent color to keep the design clean and impactful."
            }
        )
    },
    @{
        id = "10"
        slug = "cost-of-self-publishing-launch-budget"
        title = "The Cost of Self Publishing: Budgeting Your Publishing Launch"
        summary = "Plan your publishing expenses. Evaluate editing costs, cover design rates, book formatting, and marketing investments for a successful launch."
        content = "<h2>Budgeting for a Successful Self-Publishing Launch</h2><p>Self-publishing is a startup business. While uploading to Amazon KDP is free, creating a high-quality product requires investment. Understanding where to budget and where to save is critical for self-publishing success.</p><p>Loufy Publishing Services assists authors by combining premium book formatting and cover design into affordable packages.</p><h3>1. Editing: The Crucial Foundation</h3><p>Never publish an unedited manuscript. Budget for developmental editing or simple proofreading first. An edited book receives positive reviews, whereas a layout filled with typos ruins your launch.</p><h3>2. Cover Design and Interior Layouts</h3><p>Your cover is your main marketing asset, and the interior layout defines the reading experience. Budgeting for professional book cover design and formatting checks prevents layout errors that trigger returns on Amazon.</p><h3>3. Launch Marketing and Reviews</h3><p>Allocate a portion of your budget to marketing. Use Amazon Ads to gain initial search visibility and set up a book launch group to acquire initial honest reviews. Reviews are the ultimate conversion driver.</p>"
        image_url = "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&fit=crop"
        category = "KDP Publishing"
        tags = @("Self Publishing Services", "Author Services", "Loufy KDP Publishing", "Book Publishing Services")
        author_name = "Loufy Publisher"
        published_at = "2026-06-17T07:00:00Z"
        read_time = 5
        is_featured = $false
        seo_title = "The Cost of Self Publishing: Budgeting Guide | Loufy Publisher"
        seo_description = "Learn self-publishing launch costs. Find tips to budget for editing, formatting, book cover design, and marketing on Amazon KDP."
        faqs = @(
            @{
                question = "Where should I invest the most budget during a book launch?"
                answer = "Invest primarily in editing and professional book cover design. These two factors dictate your book's quality and click-through rates."
            }
        )
    },
    @{
        id = "11"
        slug = "hardcover-formatting-margin-spine-calculations"
        title = "Hardcover Formatting Guide: Margin Alignment and Spine Calculations"
        summary = "Calculate hardcover spine dimensions and inner margins. Master KDP hardcover casing layouts, bleed, and flap margins."
        content = "<h2>Hardcover Formatting Rules for Self-Publishers</h2><p>KDP hardcover publishing is a great way to offer a premium edition of your book. However, hardcover formatting requires precise spine calculations and margin alignment parameters due to the thick cardboard binding casing.</p><p>As a Hamid Raza Publisher expert, I ensure your hardcover layouts are print-ready and meet KDP specifications.</p><h3>1. Hardcover Spine Sizing</h3><p>The spine size of a hardcover cover is calculated using a specific formula based on page count and paper type (white vs. cream). A hardcover spine is usually wider than a paperback because the cover flaps fold over the board edges. Incorrect calculations will stretch your cover graphics.</p><h3>2. Margin Wrap-Around Settings</h3><p>Hardcover covers require a 0.625-inch wrap-around bleed (fold margin), compared to just 0.125 inches for paperbacks. This wrap area folds over the cardboard cover boards. Ensure no text or essential graphic details sit inside this fold zone.</p><h3>3. Inside Hinge Safety Margin</h3><p>The inside pages of a hardcover require a slightly wider gutter margin (the hinge gap) so pages can lay open. Keep page numbers and headers well within safe margins to avoid overlap with the binding glue.</p>"
        image_url = "https://images.unsplash.com/photo-1491849794226-47098b1e4244?w=800&fit=crop"
        category = "Book Formatting"
        tags = @("Hardcover Formatting", "Book Formatting", "Hamid Raza Publisher", "Loufy Book Formatting")
        author_name = "Hamid Raza (KDP Expert)"
        published_at = "2026-06-17T09:00:00Z"
        read_time = 5
        is_featured = $false
        seo_title = "Hardcover Formatting: Spine Calculations & Margins | Loufy Publisher"
        seo_description = "Master hardcover formatting spine dimensions. Learn trim bleed, hinge margins, and cover wrap specifications for KDP hardcover books."
        faqs = @(
            @{
                question = "What is the minimum page count for a KDP hardcover?"
                answer = "Amazon KDP requires a minimum of 75 pages to print a hardcover edition."
            }
        )
    },
    @{
        id = "12"
        slug = "bestselling-book-interior-fonts-layout"
        title = "Bestselling Book Interior Layouts: Classic Fonts & Page Numbers"
        summary = "Discover the typography secrets of bestselling books. Learn fonts, chapter header designs, line heights, and footer page number setups."
        content = "<h2>Designing Beautiful Book Interior Layouts</h2><p>Bestselling books look premium inside because of subtle typography choices. A book layout is not just about margins; it is about line heights, chapter drop caps, and selecting classic fonts that prevent eye strain.</p><p>Using expert book publishing services ensures your manuscript page interior layout feels consistent and polished.</p><h3>1. Industry-Standard Typography Fonts</h3><p>Never format a print book using Arial or Times New Roman; these fonts feel cheap and amateur. Bestsellers use classic serif typography like Garamond, Sabon, Georgia, or Caslon. These fonts are designed to maximize readability on print paper.</p><h3>2. Chapters and Heading Drop Caps</h3><p>To give your book interior a premium feel, add drop caps (large capital letter spanning 2 or 3 lines of text) to the start of each chapter. Design chapter headers with consistent spacing, centered numbers, and small caps styling.</p><h3>3. Aligning Line Spacing and Margins</h3><p>Line spacing (leading) should be set to 1.15x or 1.25x the font size. Keep line heights consistent across all pages so they line up perfectly from page to page. This attention to detail creates a clean, premium reading experience.</p>"
        image_url = "https://images.unsplash.com/photo-1463320306483-b46826471f3f?w=800&fit=crop"
        category = "Book Formatting"
        tags = @("Book Formatting", "Book Publishing Services", "Hamid Raza KDP Expert", "Loufy Book Formatting")
        author_name = "Hamid Raza (KDP Expert)"
        published_at = "2026-06-17T10:00:00Z"
        read_time = 5
        is_featured = $false
        seo_title = "Bestselling Book Interior Layouts & Fonts | Loufy Publisher"
        seo_description = "Learn the typography rules of bestselling book interior layouts. Discover fonts, chapter designs, drop caps, and page spacing secrets."
        faqs = @(
            @{
                question = "What is the best font size for a print paperback book?"
                answer = "The standard font size is 10pt or 11pt, combined with 1.15x or 1.25x line height, depending on the font style selected."
            }
        )
    }
)

$bodyObj = @{
    html_content = (ConvertTo-Json -InputObject $blogs -Depth 10 -Compress)
}
$bodyJson = ConvertTo-Json -InputObject $bodyObj -Compress
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)

Write-Host "Seeding 12 blogs into Supabase..."
$updateUri = "$supabaseUrl/rest/v1/site_content?id=eq.blogs_json"

try {
    $res = Invoke-RestMethod -Uri $updateUri -Headers $headers -Method Patch -Body $bodyBytes
    Write-Host "Seeding 12 blogs completed successfully!"
} catch {
    Write-Error "Failed to seed 12 blogs: $_"
}
