'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconSearch } from '@tabler/icons-react';
import { atom, useAtom } from 'jotai';
import Papa from 'papaparse';
import { CloseButton, Combobox, Loader, TextInput, useCombobox } from '@mantine/core';
import { cacheAtom, isCachedItemExpired } from '@/data/Helpers/CacheHelper';
import { projectsAtom } from '@/data/Helpers/ProjectData';
import { getTransitServices, TransitServiceType } from '@/data/Helpers/TransitServiceData';
import SearchFilter from './SearchFIlter';
import styles from './Search.module.css';

const searchFilterAtom = atom('Projects');
const searchTextAtom = atom('');

interface Initiative {
  title: string;
  description?: string;
}

interface AcepLookup {
  code: string;
  description: string;
}

const Search = ({
  hiddenFrom,
  visibleFrom,
  showFilter = false,
}: {
  hiddenFrom?: string;
  visibleFrom?: string;
  showFilter?: boolean;
}) => {
  const [projects] = useAtom(projectsAtom);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string[] | null>(null);
  const [value, setValue] = useAtom(searchTextAtom);
  const [empty, setEmpty] = useState(false);
  const abortController = useRef<AbortController | undefined>(null);
  const [searchFilter, setSearchFilter] = useAtom(searchFilterAtom);
  const [initiativeData, setInitiativeData] = useState<Initiative[]>([]);
  const [transitServices, setTransitServices] = useState<TransitServiceType[]>([]);
  const [acepData, setAcepData] = useState<AcepLookup[]>([]);
  const [cacheItems] = useAtom(cacheAtom);
  const router = useRouter();
  const [placeholderText, setPlaceholderText] = useState(
    'Search projects, ACEPs, initiatives, and transit services'
  );

  useEffect(() => {
    import('@/data/initiatives.json').then((response) => {
      const initiatives = response.default;
      setInitiativeData(initiatives);
    });

    getTransitServices().then((services) => {
      setTransitServices(services);
    });
  }, []);

  useEffect(() => {
    if (cacheItems.length === 0) {
      return;
    }
    const keyName = 'acepData';
    const acepDataStr = localStorage.getItem(keyName);

    if (isCachedItemExpired(keyName, cacheItems)) {
      fetch('/data/aceps-lookup.csv')
        .then((response) => response.text())
        .then((csvData) => {
          localStorage.setItem(keyName, JSON.stringify({ cacheDate: new Date(), data: csvData }));
          const acepData = parseAcepLookupCsv(csvData);
          setAcepData(acepData);
        });
    } else {
      const acepData = parseAcepLookupCsv(JSON.parse(acepDataStr || '{}').data);
      setAcepData(acepData);
    }
  }, [cacheItems]);

  const parseAcepLookupCsv = (csvText: string): AcepLookup[] => {
    const parsed = Papa.parse<AcepLookup>(csvText, {
      header: true,
    });
    return parsed.data;
  };

  // const openAcepModal = (acep: string) => {
  //   router.push(`/?acepId=${encodeURIComponent(acep)}`);
  // };

  // const handleProjectSelected = useCallback(
  //   (projectId: string) => {
  //     const projectDetail =
  //       projects.find((p) => Number(p.project_id) === Number(projectId)) || null;

  //     if (projectDetail) {
  //       router.push(`/?projectId=${encodeURIComponent(projectDetail.project_id)}`);
  //     }
  //   },
  //   [projects]
  // );

  // const searchAceps = (query: string, signal: AbortSignal) => {
  //   return searchAcep(query, signal).then((result) => {
  //     const uniqueResults = Array.from(
  //       new Map(result.map((item) => [`${item.acep} - ${item.title}`, item])).values()
  //     );
  //     return uniqueResults;
  //   });
  // };

  const fetchOptions = (query: string) => {
    if (!query || query.trim() === '' || query === null) {
      setData(null);
      setEmpty(true);
      return;
    }

    abortController.current?.abort();
    abortController.current = new AbortController();
    setLoading(true);

    // if (searchFilter === 'ACEPs') {
    //   searchAceps(query, abortController.current.signal)
    //     .then((result) => {
    //       // Ensure each item is unique by acep and title
    //       const uniqueResults = Array.from(
    //         new Map(result.map((item) => [`${item.acep} - ${item.title}`, item])).values()
    //       );

    //       setData(uniqueResults.map((item) => `${item.acep} - ${item.title}`));
    //       setLoading(false);
    //       setEmpty(result.length === 0);
    //       abortController.current = undefined;
    //     })
    //     .catch(() => {});
    // } else if (searchFilter === 'Projects') {
    //   searchProjects(query, abortController.current.signal)
    //     .then((result) => {
    //       // Ensure each item is unique by project_id and title
    //       const uniqueResults = Array.from(
    //         new Map(result.map((item) => [`${item.project_id} - ${item.title}`, item])).values()
    //       );

    //       setData(uniqueResults.map((item) => `${item.project_id} - ${item.title}`));
    //       setLoading(false);
    //       setEmpty(result.length === 0);
    //       abortController.current = undefined;
    //     })
    //     .catch(() => {});
    // } else {
    // setLoading(true);
    const searchItems: string[] = [];

    projects
      .filter(
        (project) =>
          project.search_tags?.toLowerCase().includes(query.toLowerCase()) ||
          project.title.toLowerCase().includes(query.toLowerCase()) ||
          project.project_id.toString().startsWith(query.toLowerCase()) ||
          project.description?.toLowerCase().includes(query.toLowerCase())
      )
      .map((item) => `${item.project_id} - ${item.title}`)
      .forEach((item) => searchItems.push(item));

    initiativeData
      .filter(
        (initiative) =>
          initiative.title.toLowerCase().includes(query.toLowerCase()) ||
          initiative.description?.toLowerCase().includes(query.toLowerCase())
      )
      .map((item) => `Initiative - ${item.title}`)
      .forEach((item) => searchItems.push(item));

    transitServices
      .filter(
        (service) =>
          service.name.toLowerCase().includes(query.toLowerCase()) ||
          service.description?.toLowerCase().includes(query.toLowerCase())
      )
      .map((item) => `Transit Service - ${item.name}`)
      .forEach((item) => searchItems.push(item));

    acepData
      .filter(
        (acep) =>
          acep.description?.toLowerCase().includes(query.toLowerCase()) ||
          acep.code.toLowerCase().includes(query.toLowerCase())
      )
      .map((item) => `ACEP - ${item.code} - ${item.description}`)
      .forEach((item) => searchItems.push(item));

    if (searchItems.length > 0) {
      setData(searchItems);
    }

    setEmpty(searchItems.length === 0);

    setLoading(false);
  };
  // };

  const handleEverythingSelected = (value: string) => {
    if (value.startsWith('Initiative - ')) {
      const initiativeTitle = value.replace('Initiative - ', '');
      router.push(`/initiatives?item=${encodeURIComponent(initiativeTitle)}&cb=${Date.now()}`);
    } else if (value.startsWith('Transit Service - ')) {
      const transitServiceName = value.replace('Transit Service - ', '');
      router.push(
        `/transit-services?item=${encodeURIComponent(transitServiceName)}&cb=${Date.now()}`
      );
    } else if (value.startsWith('ACEP - ')) {
      const acepCode = value.replace('ACEP - ', '').split(' - ')[0];
      router.push(`/?acepId=${encodeURIComponent(acepCode)}&cb=${Date.now()}`);
    } else {
      const [projectId, _projectTitle] = value.split(' - ');
      router.push(`/?projectId=${encodeURIComponent(projectId)}&cb=${Date.now()}`);
    }
  };

  const options = (data || []).map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  return (
    <>
      <div className={styles.searchContainer}>
        <SearchFilter
          showFilter={showFilter}
          onFilterChange={(value) => {
            setSearchFilter(value);
            setPlaceholderText(
              value === 'ACEPs'
                ? 'Search ACEPs'
                : value === 'Projects'
                  ? 'Search Projects'
                  : 'Search everything else'
            );
            setValue('');
            combobox.resetSelectedOption();
            combobox.openDropdown();
          }}
          value={searchFilter}
        />
        <Combobox
          onOptionSubmit={(optionValue) => {
            // const selectedValue = optionValue.split(' - ')[0];
            // if (searchFilter === 'ACEPs') {
            //   openAcepModal(selectedValue);
            // } else if (searchFilter === 'Projects') {
            //   handleProjectSelected(selectedValue);
            // } else {
            handleEverythingSelected(optionValue);
            // }

            setValue(optionValue);
            combobox.closeDropdown();
          }}
          store={combobox}
        >
          <Combobox.Target>
            <TextInput
              value={value}
              onChange={(event) => {
                setValue(event.currentTarget.value);
                fetchOptions(event.currentTarget.value);
                combobox.resetSelectedOption();
              }}
              onClick={() => combobox.openDropdown()}
              onFocus={() => {
                if (data === null) {
                  fetchOptions(value);
                }
              }}
              onBlur={() => combobox.closeDropdown()}
              rightSection={
                value.length !== 0 ? (
                  <CloseButton
                    size="sm"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setValue('')}
                    aria-label="Clear value"
                  />
                ) : (
                  <>
                    {loading && <Loader size={18} />}
                    <IconSearch size={16} />
                  </>
                )
              }
              visibleFrom={visibleFrom}
              hiddenFrom={hiddenFrom}
              className={styles.searchInput}
              placeholder={placeholderText}
            />
          </Combobox.Target>

          <Combobox.Dropdown
            hidden={data === null || data.length === 0 || (!loading && empty) || value.length === 0}
          >
            <Combobox.Options style={{ maxHeight: 200, overflowY: 'auto' }}>
              {empty && value.length > 0 && <Combobox.Empty>No results found</Combobox.Empty>}
              {!empty && value.length > 0 && options}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
      </div>
    </>
  );
};

export default Search;
