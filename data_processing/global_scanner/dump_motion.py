import asyncio
import sys
import os
import json

# Add parent directory to sys.path to find 'common'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import common

async def dump_motion():
    async with await common.create_aiohttp_session() as session:
        # Wahlprogramm 2016, erste Motion (slug: wahlprogramm-2016)
        # Ich rate mal einen Motion-Slug oder schaue in den Log von vorhin.
        # Im Log stand: Verarbeite Konvent: wahlprogramm-2016, Found 99 motions.
        
        # Zuerst die Motion-Slugs holen
        url = "https://berlin.antragsgruen.de/rest/wahlprogramm-2016"
        async with session.get(url, headers=common.get_headers()) as resp:
            data = await resp.json()
            motion_links = data.get('motion_links', [])
            if not motion_links:
                print("Keine Motion Links gefunden.")
                return
            
            print(f"Sample motion link: {motion_links[0]}")
            m_slug = motion_links[0].get('slug')
            print(f"Lade Motion: {m_slug}")
            
            m_url = f"https://berlin.antragsgruen.de/rest/wahlprogramm-2016/motion/{m_slug}"
            async with session.get(m_url, headers=common.get_headers()) as mresp:
                mdata = await mresp.json()
                print(f"Keys in motion-specific response: {list(mdata.keys())}")
                if 'amendments' in mdata and mdata['amendments']:
                    print(f"Sample amendment: {mdata['amendments'][0]}")
                if 'amendment_links' in mdata and mdata['amendment_links']:
                    print(f"Sample amendment_link: {mdata['amendment_links'][0]}")
            return

if __name__ == "__main__":
    asyncio.run(dump_motion())
