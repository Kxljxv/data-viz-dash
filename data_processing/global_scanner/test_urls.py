import asyncio
import aiohttp
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import common

async def test_url_patterns():
    async with await common.create_aiohttp_session() as session:
        # Bekannte ID 1003 in wahlprogramm-2016 (Motion: Projekt_23-53866)
        slug = "wahlprogramm-2016"
        am_id = 1003
        
        patterns = [
            f"https://berlin.antragsgruen.de/rest/amendment/1003"
        ]
        
        for url in patterns:
            print(f"\nTesting: {url}")
            async with session.get(url, headers=common.get_headers()) as resp:
                print(f"Status: {resp.status}")
                try:
                    data = await resp.json()
                    print(f"JSON Success: {data.get('success')}")
                    if not data.get('success'):
                        print(f"Message: {data.get('message')}")
                except:
                    text = await resp.text()
                    print(f"Text (first 100 chars): {text[:100]}")

if __name__ == "__main__":
    asyncio.run(test_url_patterns())
