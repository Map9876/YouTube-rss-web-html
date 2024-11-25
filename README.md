# RSS Feed Reader
*A simple RSS feed reader for configuring and displaying multiple feeds. Easily track and find posts from all your RSS feeds in one place. Stay updated with new content from your favorite sources. Simple and user-friendly. Install it as a PWA for quick access and a smooth experience.*

[https://romiojoseph.github.io/rss-feed-reader](https://romiojoseph.github.io/rss-feed-reader)


**Disclaimer:** This platform's JavaScript is fully built using Mistral AI. It uses a CORS proxy to fetch RSS feeds. All data is processed locally in your browser, and your feeds are stored on your device without being sent to any server.

## FAQ

First of all, I haven’t added any trackers or analytics, so feel free to browse without worry.

### Why another feed reader?
Honestly, I built this for myself because a few weeks ago, Omnivore announced [they were joining ElevenLabs](https://www.theverge.com/rss/index.xml) and [shutting down their service.](https://blog.omnivore.app/p/details-on-omnivore-shutting-down) I started searching for a new one but thought, why not try building one myself? And here I am. My initial plan was to create an Android app, but I temporarily settled for this. Maybe someday I'll revisit the idea.

### What is an RSS feed?
RSS feeds provide updates about the latest posts, blogs, or articles from a website. For example, you can check this feed: [The Verge RSS feed](https://www.theverge.com/rss/index.xml).

### How can I find an RSS feed for a website?
Many blogs and websites have RSS feeds by default. To check, visit [Feedsearch](https://feedsearch.dev/) and paste any website URL. It will show if an RSS feed is available.

### Why use RSS feeds?
When you subscribe to an RSS feed using an RSS reader app, you get updates directly in your feed. This saves you from manually checking websites, newsletters, or profiles. You can curate your own news feed and stay in control of what you want to see. [Shared a blog here](https://romio.substack.com/p/rss-feeds-vs-email-subscriptions).

### Which RSS reader apps should I try?
If you're not happy here, you can check out the Vivaldi browser, it includes an RSS reader, so you can use it without relying on third-party apps. However, this feature is currently unavailable on their mobile app. Other options include apps like [Feeder](https://feeder.co/).

### Do RSS feeds only show a few posts and replace old ones?
Yes, RSS feeds typically show a limited number of recent posts (e.g., 10-20), and older ones are replaced as new content is added. To keep track of older posts, you can [bookmark or save the link using a service like Raindrop](https://raindrop.io).

### What is a CORS proxy, and why is it used?
A CORS proxy allows the app to fetch RSS feeds from different domains by bypassing cross-origin restrictions. This ensures the app can access and display feeds from various sources seamlessly. For this app, I used the [AllOrigins](https://allorigins.win/) CORS proxy service—thank you for the great service! The proxy acts as an intermediary, fetching the feed content and returning it to the app for display.

### How often are the feeds refreshed?
The feeds are refreshed every 6 hours. The application uses a service worker to cache the feed data and set an expiration time of 6 hours. After this period, the feed data is refreshed from the server.

### What happens if I manually refresh the feeds?
You can manually refresh the feeds by pressing "Ctrl+F5" the tab (On mobile, swipe down twice). This triggers a fresh fetch of the feed data, bypassing the cache.

### What happens if I clear my browser data, including cache and cookies?
If you clear your browser data, including cache and cookies, the cached feed data, configured feeds, and the last fetched timestamps will be lost. The application will need to fetch the feed data fresh from the server the next time you select a feed.

### Where is my data processed?
All data processing, including filtering and rendering, happens locally within your browser. Your configured feeds are stored in your browser's local storage.

### Is my data sent to any servers?
No, your configured feeds and search data are not sent to any external servers. All operations are performed locally within your browser.

### Remember to periodically download CSV backup
If you regularly add feed URLs manually, I suggest you use the Google Sheet way for easier management. However, if that feels like too much work, remember to download the CSV every now and then to keep a backup of your feeds.

### How is the selected feed preserved across page reloads?
The selected feed URL is stored in local storage. On page reload, the application retrieves the selected feed URL from local storage and sets the dropdown accordingly. This ensures that your feed selection is preserved across page reloads.

### Add on: Personal Telegram bot for sending RSS feed updates to a Telegram channel
This script allows you to fetch RSS feeds, check for new posts, and send them to a Telegram channel. The script uses Google Apps Script to handle the RSS feed fetching, Telegram messaging, and Google Sheets for tracking sent posts. [Get it here](https://github.com/romiojoseph/open-source/tree/main/telegram-bots/rss-new-post-alert-via-telegram).

### How to get a YouTube channel's RSS feed?

To find the YouTube RSS feed for a channel, go to the channel's page. Right-click on the page and choose "View Page Source." Then, search for `channel_id=` in the source code. Copy the value that follows, which is the channel's ID. To create the feed URL, use the format: `https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID`. Replace `CHANNEL_ID` with the ID you copied. This will give you the RSS feed for that channel

### These FAQs were also created by Mistral AI
I shared the entire project code with Mistral AI and asked it to generate FAQs based on the code.



---

##### Terms and Conditions, Privacy Policy, and Disclaimer

###### Terms and Conditions

###### Acceptable Use
- Users must not use the application for any illegal activities.
- Users must not attempt to disrupt or interfere with the application's functionality.
###### Limitations of Liability
- The application is provided "as is" without any warranties.
- I'm not liable for any damages arising from the use of the application.
###### Changes to Terms
- The terms and conditions may be updated at any time without prior notice.

##### Privacy Policy

###### Data Collection
- This application does not collect any personal data from users.
- No trackers or analytics tools are used.
###### Data Storage
- All data processing, including filtering and rendering, happens locally within your browser.
- Your configured feeds are stored in your browser's local storage.
###### Changes to Privacy Policy
- The privacy policy may be updated at any time without prior notice.

#####  Disclaimer

###### General Disclaimer
- The information provided by the application is for general informational purposes only.
- All information is provided in good faith, however, I make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the application.

###### External Links
- The application may contain links to external websites that are not provided or maintained by or in any way affiliated with the application.
- Please note that the application does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.

###### Changes to Disclaimer
- The disclaimer may be updated at any time without prior notice.

---

By using this application, you agree to the terms and conditions, privacy policy, and disclaimer outlined above.
