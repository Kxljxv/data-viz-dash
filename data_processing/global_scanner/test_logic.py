import asyncio
import sys
import os

# Add parent directory to sys.path to find 'common'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import common

async def test_logic():
    # ID 99310 gehört zu 'antragskommission-workshop-2026-01-10'
    am_id = 99310
    
    # Teste HTML API gegen einen ANDEREN Konvent
    wrong_slug = 'LDK26-1'
    url_wrong = f"https://berlin.antragsgruen.de/{wrong_slug}/amendment/{am_id}"
    
    # Teste HTML API gegen eine NICHT EXISTIERENDE ID
    fake_id = 999999
    url_fake = f"https://berlin.antragsgruen.de/LDK26-1/amendment/{fake_id}"
    
    async with await common.create_aiohttp_session() as session:
        for name, url in [("FALSCH (Existiert)", url_wrong), ("FALSCH (Existiert nicht)", url_fake)]:
            print(f"\n--- Teste {name}: {url} ---")
            async with session.get(url, headers=common.get_headers(), allow_redirects=True) as resp:
                print(f"Status: {resp.status}")
                text = await resp.text()
                if "gehört nicht zum Antrag" in text or "does not belong to this application" in text:
                    print(">>> LOGIK BESTÄTIGT: Fehlermeldung gefunden!")
                else:
                    print(">>> Keine Fehlermeldung gefunden.")
                print(f"Text snippet: {text[:1000]}")

if __name__ == "__main__":
    asyncio.run(test_logic())
