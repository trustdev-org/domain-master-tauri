import { Domain } from '../types';

// Helper to delay execution (to avoid rate limits)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchWhoisData = async (domain: string): Promise<Partial<Domain> | null> => {
  // Skip .cn domains as they are not supported by RDAP.org/public RDAP often requires specific client handling
  if (domain.endsWith('.cn')) {
    return {
       rawWhois: 'CN domains are not supported by public RDAP services.',
       updateStatus: 'manual_check',
    };
  }

  try {
    // Using rdap.org as a proxy/service for WHOIS data
    // Note: RDAP is the modern replacement for WHOIS.
    const response = await fetch(`https://rdap.org/domain/${domain}`, {
      headers: {
        'Accept': 'application/rdap+json'
      }
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 400 || response.status === 500) {
        // Domain not found or TLD not supported by RDAP.org
        // Just return null or basic info without throwing
        return {
           rawWhois: `Whois lookup failed or not supported for this TLD (Status: ${response.status})`,
           updateStatus: 'manual_check',
        };
      }
      throw new Error(`RDAP error: ${response.status}`);
    }

    const data = await response.json();

    // Parse RDAP data to extract dates and registrar
    // Structure varies, but common fields exist
    
    let registrationDate = null;
    let expirationDate = null;
    let registrar = 'Unknown';

    // Extract events
    if (data.events) {
      const regEvent = data.events.find((e: any) => e.eventAction === 'registration');
      const expEvent = data.events.find((e: any) => e.eventAction === 'expiration');
      
      if (regEvent) registrationDate = regEvent.eventDate.split('T')[0];
      if (expEvent) expirationDate = expEvent.eventDate.split('T')[0];
    }

    // Extract registrar
    if (data.entities) {
        const registrarEntity = data.entities.find((e: any) => 
            e.roles && e.roles.includes('registrar')
        );
        if (registrarEntity && registrarEntity.vcardArray) {
            // vCard parsing is complex, usually the name is in fn
            // vcardArray: ["vcard", [["version", {}, "text", "4.0"], ["fn", {}, "text", "Name"]]]
            const vcard = registrarEntity.vcardArray[1];
            const fnEntry = vcard.find((item: any) => item[0] === 'fn');
            if (fnEntry) {
                registrar = fnEntry[3];
            }
        }
    }

    return {
      registrationDate,
      expirationDate,
      registrar,
      rawWhois: JSON.stringify(data, null, 2),
      updateStatus: 'success',
    };

  } catch (error) {
    console.error(`Error fetching WHOIS for ${domain}:`, error);
    return {
        updateStatus: 'manual_check',
        rawWhois: `Error during fetch: ${error}`,
    };
  }
};

export const updateAllDomains = async (
  domains: Domain[], 
  onProgress: (current: number, total: number, currentDomain: string) => void,
  onDomainUpdated?: (updatedDomain: Domain) => void
): Promise<Domain[]> => {
  const updatedDomains = [...domains];
  
  for (let i = 0; i < updatedDomains.length; i++) {
    const domain = updatedDomains[i];
    onProgress(i + 1, updatedDomains.length, domain.name);
    
    const whoisData = await fetchWhoisData(domain.name);
    
    if (whoisData) {
      const updated = {
        ...domain,
        ...whoisData,
        lastUpdated: Date.now(),
      };
      updatedDomains[i] = updated;
      if (onDomainUpdated) {
        onDomainUpdated(updated);
      }
    }
    
    // Gentle rate limiting
    await delay(1000); 
  }
  
  return updatedDomains;
};
