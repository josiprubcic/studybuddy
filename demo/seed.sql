-- Demo cards and today's focus blocks. Run by reset-demo.sh after the three notes are uploaded.
-- Each card's quote is a sentence copied from its section, as the AI generator is required to do.

insert into cards (chunk_id, user_id, type, question, answer, quote)
select ch.id, d.user_id, v.type, v.question, v.answer, v.quote
from (values
  -- Biologija stanice
  ('biologija-stanice.pdf', 'Jezgra', 'flashcard',
   'Što se nalazi u jezgri stanice?', 'Većina stanične DNA.',
   'Jezgra je najveći organel eukariotske stanice i u njoj se nalazi većina stanične DNA.'),
  ('biologija-stanice.pdf', 'Jezgra', 'fill_in',
   'Jezgru omeđuje dvostruka jezgrina ovojnica s ____ kroz koje molekule ulaze u jezgru i izlaze iz nje.', 'porama',
   'Jezgru omeđuje dvostruka jezgrina ovojnica s porama kroz koje molekule ulaze u jezgru i izlaze iz nje.'),
  ('biologija-stanice.pdf', 'Mitohondriji', 'flashcard',
   'Gdje nastaje najveći dio ATP-a?', 'U mitohondrijima.',
   'U njima nastaje najveći dio ATP-a, molekule koja stanici služi kao izvor energije.'),
  ('biologija-stanice.pdf', 'Mitohondriji', 'fill_in',
   'Mitohondrij ima vanjsku i unutarnju membranu, a unutarnja je membrana naborana u ____.', 'kriste',
   'Mitohondrij ima vanjsku i unutarnju membranu, a unutarnja je membrana naborana u kriste.'),
  ('biologija-stanice.pdf', 'Ribosomi', 'flashcard',
   'Što se odvija na ribosomima?', 'Sinteza proteina.',
   'Ribosomi su organeli bez membrane na kojima se odvija sinteza proteina.'),
  ('biologija-stanice.pdf', 'Endoplazmatski retikul', 'flashcard',
   'Po čemu se hrapavi endoplazmatski retikul razlikuje od glatkog?',
   'Hrapavi nosi ribosome i dorađuje proteine; glatki sintetizira lipide i razgrađuje štetne tvari.',
   'Hrapavi endoplazmatski retikul nosi ribosome i sudjeluje u sintezi i doradi proteina.'),
  ('biologija-stanice.pdf', 'Golgijevo tijelo', 'fill_in',
   '____ dorađuje, razvrstava i pakira proteine i lipide koje je stanica sintetizirala.', 'Golgijevo tijelo',
   'Golgijevo tijelo dorađuje, razvrstava i pakira proteine i lipide koje je stanica sintetizirala.'),

  -- Prvi svjetski rat
  ('prvi-svjetski-rat.pdf', 'Povod rata', 'flashcard',
   'Što je bio povod Prvog svjetskog rata?',
   'Atentat u Sarajevu 28. lipnja 1914., kad je Gavrilo Princip ubio Franju Ferdinanda.',
   'Povod rata bio je atentat u Sarajevu 28. lipnja 1914. godine.'),
  ('prvi-svjetski-rat.pdf', 'Povod rata', 'fill_in',
   'Austro-Ugarska je mjesec dana kasnije, 28. srpnja 1914., objavila rat ____.', 'Srbiji',
   'Austro-Ugarska je mjesec dana kasnije, 28. srpnja 1914., objavila rat Srbiji.'),
  ('prvi-svjetski-rat.pdf', 'Savezi', 'flashcard',
   'Koje su države činile Antantu?', 'Francuska, Rusija i Ujedinjeno Kraljevstvo.',
   'Antantu su činile Francuska, Rusija i Ujedinjeno Kraljevstvo.'),
  ('prvi-svjetski-rat.pdf', 'Zapadno bojište', 'fill_in',
   'Bitka na ____ 1914. godine zaustavila je njemačko napredovanje prema Parizu.', 'Marni',
   'Bitka na Marni 1914. godine zaustavila je njemačko napredovanje prema Parizu.'),
  ('prvi-svjetski-rat.pdf', 'Prekretnica 1917. godine', 'flashcard',
   'Kako je Rusija izašla iz rata?', 'Mirom u Brest-Litovsku u ožujku 1918.',
   'Rusija je izašla iz rata mirom u Brest-Litovsku u ožujku 1918. godine.'),
  ('prvi-svjetski-rat.pdf', 'Kraj rata', 'flashcard',
   'Kada je potpisano primirje na zapadnom bojištu?', '11. studenoga 1918.',
   'Primirje na zapadnom bojištu potpisano je 11. studenoga 1918. godine.'),

  -- Newtonovi zakoni gibanja
  ('newtonovi-zakoni.pdf', 'Prvi Newtonov zakon', 'flashcard',
   'Kako se još naziva prvi Newtonov zakon?', 'Zakon tromosti.',
   'Prvi Newtonov zakon naziva se i zakon tromosti.'),
  ('newtonovi-zakoni.pdf', 'Prvi Newtonov zakon', 'fill_in',
   'Mjera tromosti tijela je njegova ____.', 'masa',
   'Mjera tromosti tijela je njegova masa.'),
  ('newtonovi-zakoni.pdf', 'Drugi Newtonov zakon', 'flashcard',
   'Kako glasi formula drugog Newtonova zakona?', 'F = m · a',
   'Zakon se zapisuje formulom F = m · a.'),
  ('newtonovi-zakoni.pdf', 'Drugi Newtonov zakon', 'fill_in',
   'Jedinica sile je ____, a 1 N = 1 kg · m/s².', 'njutn',
   'Jedinica sile je njutn, a 1 N = 1 kg · m/s².'),
  ('newtonovi-zakoni.pdf', 'Treći Newtonov zakon', 'flashcard',
   'Zašto se akcija i reakcija ne poništavaju?', 'Jer djeluju na različita tijela.',
   'Akcija i reakcija djeluju na različita tijela, pa se ne poništavaju.'),
  ('newtonovi-zakoni.pdf', 'Težina tijela', 'flashcard',
   'Kojom se formulom računa težina tijela?', 'G = m · g',
   'Računa se formulom G = m · g, gdje je g ubrzanje sile teže.')
) as v(document, heading, type, question, answer, quote)
join documents d on d.name = v.document
join chunks ch on ch.document_id = d.id and ch.heading = v.heading;

-- Every card must have found its section; a renamed heading would otherwise drop cards silently.
do $$
begin
  if (select count(*) from cards) <> 19 then
    raise exception 'expected 19 demo cards, got % (check the section headings)', (select count(*) from cards);
  end if;
end $$;

-- Two focus blocks already done today, so the dashboard shows tomatoes.
insert into focus_sessions (user_id, type, started_at, duration_seconds, completed)
select u.id, 'focus', now() - v.ago, 1500, true
from users u, (values (interval '3 hours'), (interval '2 hours')) as v(ago)
where u.auth0_id = 'dev-user';
