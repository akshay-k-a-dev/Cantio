import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { LandingLayout } from './LandingLayout';

const faqItems = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is Cantio?',
        a: 'Cantio is a free, open-source music player that streams from YouTube Music without ads, tracking, or forced accounts. It prioritizes privacy and user control.'
      },
      {
        q: 'Do I need to create an account to use Cantio?',
        a: 'No. You can use Cantio in guest mode without ever signing up. Create an account only if you want to sync playlists and liked songs across devices.'
      },
      {
        q: 'Is Cantio really free?',
        a: 'Yes, completely. Cantio is open source (MIT license) with no premium tier, no ads, and no hidden costs. Use it forever without paying.'
      },
      {
        q: 'How does Cantio stream music without ads?',
        a: 'Cantio uses YouTube Music\'s Innertube API to fetch songs. We don\'t inject ads—Cantio gives you pure streaming without monetization.'
      }
    ]
  },
  {
    category: 'Features',
    items: [
      {
        q: 'What can I do with Cantio?',
        a: 'Stream unlimited music, create playlists, like songs, view lyrics, shuffle/repeat, reorder queues, and more. Optional: sync across devices and create "blends" with friends.'
      },
      {
        q: 'Can I download music to listen offline?',
        a: 'Cantio works as a PWA (Progressive Web App) with offline capabilities. You can install it and listen to previously cached songs offline.'
      },
      {
        q: 'What are "blends"?',
        a: 'Blends are shared playlists created by merging two people\'s music tastes. You can create a blend with a friend and both listen to the same curated playlist.'
      },
      {
        q: 'Does Cantio have lyrics support?',
        a: 'Yes. Cantio shows synced lyrics for supported songs, displayed in real-time as the track plays.'
      }
    ]
  },
  {
    category: 'Privacy & Data',
    items: [
      {
        q: 'Does Cantio track my listening behavior?',
        a: 'No. Cantio has zero analytics, telemetry, or tracking. Your listening history stays on your device unless you explicitly log in and enable cloud sync.'
      },
      {
        q: 'What data does Cantio collect?',
        a: 'In guest mode: none. If you create an account: only what you explicitly store (liked songs, playlists, sync data). No behavioral tracking, no ads profiling.'
      },
      {
        q: 'Is Cantio auditable?',
        a: 'Yes. The entire codebase is open source on GitHub under the MIT license. You can review every line to verify our privacy claims.'
      },
      {
        q: 'Can Cantio read my music taste and sell it to advertisers?',
        a: 'Never. We don\'t have a business model based on data monetization. Cantio is a community-driven project with no VC pressure or advertising deals.'
      },
      {
        q: 'Where is my data stored?',
        a: 'In guest mode: on your device only. If you create an account: on our servers (encrypted). You can delete your account and data anytime.'
      }
    ]
  },
  {
    category: 'Platforms',
    items: [
      {
        q: 'What platforms does Cantio work on?',
        a: 'Web (PWA), Windows desktop, Linux desktop, and Android mobile app. Cross-platform sync available when logged in.'
      },
      {
        q: 'Is there an Android/iPhone app?',
        a: 'Yes, a standalone Android APK is available for download. An iOS app is planned. You can also use the Web App as a PWA on any mobile device.'
      },
      {
        q: 'Can I use Cantio on Mac?',
        a: 'The web app (PWA) works on Mac. A native Mac app is not currently available, but you can contribute to the project on GitHub.'
      },
      {
        q: 'Does Cantio work on older devices?',
        a: 'Cantio works on any device with a modern web browser (Chrome, Firefox, Safari, Edge). Desktop apps work on Windows 7+ and Linux distributions.'
      }
    ]
  },
  {
    category: 'Technical',
    items: [
      {
        q: 'How does Cantio source its music catalog?',
        a: 'Cantio uses YouTube Music\'s Innertube API (youtubei.js) to fetch song metadata and streams. This means any song on YouTube Music is available in Cantio.'
      },
      {
        q: 'Does Cantio require a YouTube account?',
        a: 'No. Cantio uses public API access to YouTube Music. You don\'t need a YouTube or Google account to use Cantio.'
      },
      {
        q: 'Is Cantio built on YouTube\'s official API?',
        a: 'Cantio uses an unofficial reverse-engineered API (Innertube). This is necessary because YouTube Music doesn\'t offer a public API for third-party apps.'
      },
      {
        q: 'Can I self-host Cantio?',
        a: 'Yes. The backend is open source and can be self-hosted. See the GitHub repository for deployment instructions.'
      }
    ]
  },
  {
    category: 'Comparison & Alternatives',
    items: [
      {
        q: 'How is Cantio different from Spotify?',
        a: 'Cantio requires no account (optional), has zero tracking (vs Spotify\'s behavioral profiling), no ads ever (vs Spotify\'s free tier), and is open source (vs Spotify\'s proprietary). Spotify has a larger catalog and better recommendations.'
      },
      {
        q: 'Is Cantio an official YouTube Music client?',
        a: 'No. Cantio is an independent, open-source YouTube Music frontend. It\'s not affiliated with Google or YouTube.'
      },
      {
        q: 'Should I use Cantio or YouTube Music official app?',
        a: 'Cantio if you value privacy and want a standalone player. YouTube Music official app if you want integrated Google ecosystem features.'
      },
      {
        q: 'Does Cantio replace Spotify?',
        a: 'For privacy-focused users who don\'t need Spotify\'s social features or sophisticated recommendations, yes. For power users, both have different strengths.'
      }
    ]
  },
  {
    category: 'Contributing & Community',
    items: [
      {
        q: 'Can I contribute to Cantio?',
        a: 'Yes. Cantio is open source and welcomes contributions. See the GitHub repository for contribution guidelines.'
      },
      {
        q: 'How can I report bugs or request features?',
        a: 'Use GitHub issues: https://github.com/akshay-k-a-dev/Cantio/issues. Or contact us at auth.cantio@gmail.com'
      },
      {
        q: 'Is there a community forum or Discord?',
        a: 'Community discussions happen on GitHub. You can also reach out via email to auth.cantio@gmail.com'
      },
      {
        q: 'Who maintains Cantio?',
        a: 'Cantio is maintained by Akshay K A and community contributors. Development is driven by user feedback and community needs.'
      }
    ]
  }
];

function FAQAccordion({ item }: { item: typeof faqItems[0]['items'][0] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden hover:border-purple-500/30 transition">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-900/50 transition text-left"
      >
        <span className="font-semibold">{item.q}</span>
        <ChevronDown className={`w-5 h-5 text-purple-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-gray-400 border-t border-gray-800">
          {item.a}
        </div>
      )}
    </div>
  );
}

export function FAQPage() {
  return (
    <LandingLayout
      title="Cantio FAQ — Frequently Asked Questions"
      description="Find answers to common questions about Cantio: privacy, features, platforms, technology, and how it compares to other music apps."
    >
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Find answers to your questions about Cantio, privacy, features, and how to get started.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        {faqItems.map((section, idx) => (
          <div key={idx} className={`mb-12 ${idx < faqItems.length - 1 ? 'pb-12 border-b border-gray-800' : ''}`}>
            <h2 className="text-2xl font-bold mb-6 text-purple-400">{section.category}</h2>
            <div className="space-y-3">
              {section.items.map((item, i) => (
                <FAQAccordion key={i} item={item} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* JSON-LD FAQPage Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': faqItems.flatMap(section =>
            section.items.map(item => ({
              '@type': 'Question',
              'name': item.q,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': item.a
              }
            }))
          )
        })}
      </script>

      {/* Still have questions */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-900/50 border-t border-gray-800">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Didn't find your answer?</h2>
          <p className="text-gray-400 mb-6">Get in touch with the Cantio community.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://github.com/akshay-k-a-dev/Cantio/issues" target="_blank" rel="noopener noreferrer" className="px-6 py-2 border border-purple-600 hover:bg-purple-600/10 rounded-lg transition">
              Report Issue on GitHub
            </a>
            <a href="mailto:auth.cantio@gmail.com" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
              Email Support
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Try Cantio?</h2>
        <p className="text-gray-400 mb-8">No account needed. Stream music now, no strings attached.</p>
        <a href="/" className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition">
          Start Listening Now
        </a>
      </section>
    </LandingLayout>
  );
}
